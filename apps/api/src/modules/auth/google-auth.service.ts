import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { StrictRateLimiter } from "../../common/rate-limit/strict-rate-limiter.js";
import type { Env } from "../../config/env.js";
import { isUniqueViolation } from "../../database/errors.js";
import { AUTH_LIMITS } from "./auth.constants.js";
import { AuthRepository } from "./auth.repository.js";
import { SessionsService } from "./sessions.service.js";
import { generateToken } from "./tokens.js";

const AUTHORIZATION_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ISSUERS = ["https://accounts.google.com", "accounts.google.com"];
const REQUEST_TIMEOUT_MS = 10_000;

/** Same rule as the web app's `safeRedirectPath`: only same-origin paths, never an open redirect. */
export const SIGNED_IN_HOME = "/viagens";
export function safeNextPath(next: string | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return SIGNED_IN_HOME;
  }
  return next;
}

/** What survives the trip to Google, kept in a short lived httpOnly cookie. */
export interface OAuthFlowState {
  state: string;
  verifier: string;
  next: string;
  /** Connect Google to the signed-in account instead of signing in. */
  link: boolean;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  name: string;
  picture: string | null;
}

interface ClientInfo {
  ip: string;
  userAgent: string | null;
}

export type GoogleCallbackResult =
  /** Signed in: set the cookie and go to `path`. */
  | { type: "session"; token: string; path: string }
  /** Nothing to set, just go to `path` (a failure, or a finished link). */
  | { type: "redirect"; path: string };

export const encodeFlowState = (flow: OAuthFlowState) =>
  Buffer.from(JSON.stringify(flow)).toString("base64url");

export function decodeFlowState(value: string | undefined): OAuthFlowState | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as OAuthFlowState;
    const valid =
      typeof parsed.state === "string" &&
      typeof parsed.verifier === "string" &&
      typeof parsed.next === "string" &&
      typeof parsed.link === "boolean";
    return valid ? parsed : null;
  } catch {
    return null;
  }
}

const sameString = (a: string, b: string) => {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
};

@Injectable()
export class GoogleAuthService {
  private readonly logger = new Logger(GoogleAuthService.name);

  constructor(
    private readonly repository: AuthRepository,
    private readonly sessions: SessionsService,
    private readonly limiter: StrictRateLimiter,
    @Inject(ConfigService) private readonly config: ConfigService<Env, true>,
  ) {}

  /** False when the credentials are not configured: the sign-in button then lands on the error. */
  get enabled() {
    return Boolean(
      this.config.get("GOOGLE_CLIENT_ID", { infer: true }) &&
      this.config.get("GOOGLE_CLIENT_SECRET", { infer: true }) &&
      this.config.get("GOOGLE_REDIRECT_URI", { infer: true }),
    );
  }

  /** Where the browser goes when something fails. A signed-in user connecting Google goes back to `next`. */
  failureUrl(flow: Pick<OAuthFlowState, "link" | "next"> | null, error = "google") {
    if (flow?.link) {
      const path = new URL(flow.next, "http://placeholder");
      path.searchParams.set("google", "error");
      return this.webUrl(`${path.pathname}${path.search}`);
    }
    return this.webUrl(`/entrar?error=${error}`);
  }

  webUrl(path: string) {
    return new URL(path, this.config.get("WEB_URL", { infer: true })).toString();
  }

  /** Authorization code flow with state and PKCE (S256). */
  async start(options: { next?: string; link: boolean }, client: ClientInfo) {
    const limits = AUTH_LIMITS.google;
    await this.limiter.hit(`google:ip:${client.ip}`, limits.ip.limit, limits.ip.windowMs);

    const flow: OAuthFlowState = {
      state: generateToken(),
      verifier: randomBytes(48).toString("base64url"),
      next: safeNextPath(options.next),
      link: options.link,
    };
    const url = new URL(AUTHORIZATION_URL);
    url.search = new URLSearchParams({
      client_id: this.config.get("GOOGLE_CLIENT_ID", { infer: true })!,
      redirect_uri: this.config.get("GOOGLE_REDIRECT_URI", { infer: true })!,
      response_type: "code",
      scope: "openid email profile",
      state: flow.state,
      code_challenge: createHash("sha256").update(flow.verifier).digest("base64url"),
      code_challenge_method: "S256",
      // Lets the person pick the account, which matters when several are signed in to Google.
      prompt: "select_account",
    }).toString();
    return { url: url.toString(), flow };
  }

  async finish(
    query: { code?: string; state?: string; error?: string },
    flow: OAuthFlowState | null,
    sessionToken: string | undefined,
    client: ClientInfo,
  ): Promise<GoogleCallbackResult> {
    // No flow cookie, a mismatched state or a refusal at Google (the user said no): back to the start.
    if (!flow || !query.state || !sameString(query.state, flow.state) || !query.code) {
      if (query.error) this.logger.log(`Google refused the sign-in: ${query.error}`);
      return { type: "redirect", path: this.failureUrl(flow) };
    }

    try {
      const limits = AUTH_LIMITS.google;
      await this.limiter.hit(`google:ip:${client.ip}`, limits.ip.limit, limits.ip.windowMs);
      const profile = await this.fetchProfile(query.code, flow.verifier);
      return flow.link
        ? await this.link(profile, flow, sessionToken)
        : await this.signIn(profile, flow, client);
    } catch (error) {
      this.logger.warn(`Google sign-in failed: ${(error as Error).message}`);
      return { type: "redirect", path: this.failureUrl(flow) };
    }
  }

  private async signIn(
    profile: GoogleProfile,
    flow: OAuthFlowState,
    client: ClientInfo,
  ): Promise<GoogleCallbackResult> {
    let user = await this.repository.findUserByGoogleId(profile.sub);
    let isNew = false;

    if (!user) {
      // A password account with this e-mail is never linked silently: the owner has to sign in
      // with the password first and connect Google from the profile.
      if (await this.repository.findUserByEmail(profile.email)) {
        return { type: "redirect", path: this.failureUrl(flow, "account-exists") };
      }
      try {
        user = await this.repository.createGoogleUser({
          email: profile.email,
          name: profile.name,
          photoUrl: profile.picture,
          providerUserId: profile.sub,
        });
        isNew = true;
      } catch (error) {
        // Two first accesses racing: the unique index decides, the loser asks to try again.
        if (isUniqueViolation(error)) {
          return { type: "redirect", path: this.failureUrl(flow, "account-exists") };
        }
        throw error;
      }
    }

    const token = await this.sessions.create(user.id, client.userAgent);
    return { type: "session", token, path: this.webUrl(isNew ? "/onboarding" : flow.next) };
  }

  private async link(
    profile: GoogleProfile,
    flow: OAuthFlowState,
    sessionToken: string | undefined,
  ): Promise<GoogleCallbackResult> {
    const session = sessionToken ? await this.sessions.validate(sessionToken) : null;
    if (!session) return { type: "redirect", path: this.failureUrl(flow) };

    const owner = await this.repository.findUserByGoogleId(profile.sub);
    // That Google account already belongs to someone else.
    if (owner && owner.id !== session.user.id) {
      return { type: "redirect", path: this.failureUrl(flow) };
    }
    try {
      await this.repository.linkGoogle({
        userId: session.user.id,
        providerUserId: profile.sub,
        email: profile.email,
      });
    } catch (error) {
      if (isUniqueViolation(error)) return { type: "redirect", path: this.failureUrl(flow) };
      throw error;
    }
    return { type: "redirect", path: this.webUrl(flow.next) };
  }

  /**
   * Swaps the code for tokens and reads the identity from the ID token. The token comes straight from
   * Google's token endpoint over TLS, so its claims are trusted without checking the signature
   * (the documented option for this flow); issuer, audience and expiry are still checked.
   */
  private async fetchProfile(code: string, verifier: string): Promise<GoogleProfile> {
    const clientId = this.config.get("GOOGLE_CLIENT_ID", { infer: true })!;
    const response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: this.config.get("GOOGLE_CLIENT_SECRET", { infer: true })!,
        redirect_uri: this.config.get("GOOGLE_REDIRECT_URI", { infer: true })!,
        grant_type: "authorization_code",
        code_verifier: verifier,
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new Error(`token endpoint answered ${response.status}`);

    const { id_token: idToken } = (await response.json()) as { id_token?: string };
    const payload = idToken?.split(".")[1];
    if (!payload) throw new Error("no id_token in the answer");
    const claims = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      iss?: string;
      aud?: string;
      exp?: number;
      sub?: string;
      email?: string;
      email_verified?: boolean | string;
      name?: string;
      picture?: string;
    };

    if (!claims.iss || !ISSUERS.includes(claims.iss)) throw new Error("unexpected issuer");
    if (claims.aud !== clientId) throw new Error("unexpected audience");
    if (!claims.exp || claims.exp * 1000 <= Date.now()) throw new Error("expired id_token");
    if (!claims.sub || !claims.email) throw new Error("id_token without sub or e-mail");
    // Linking accounts by an unverified address would let anyone claim someone else's e-mail.
    if (claims.email_verified !== true && claims.email_verified !== "true") {
      throw new Error("e-mail not verified at Google");
    }

    const email = claims.email.trim().toLowerCase();
    return {
      sub: claims.sub,
      email,
      name: claims.name?.trim() || email.split("@")[0],
      picture: claims.picture ?? null,
    };
  }
}
