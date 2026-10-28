import {
  ConflictException,
  GoneException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { StrictRateLimiter } from "../../common/rate-limit/strict-rate-limiter.js";
import type { Env } from "../../config/env.js";
import { AUTH_LIMITS, EMAIL_CHANGE_TOKEN_TTL_MS, RESET_TOKEN_TTL_MS } from "./auth.constants.js";
import { isUniqueViolation } from "../../database/errors.js";
import { AuthRepository, toSessionUser } from "./auth.repository.js";
import { MailerService } from "../mail/mailer.service.js";
import type { SessionUser } from "./session-user.js";
import { PasswordService } from "./password.service.js";
import { SessionsService } from "./sessions.service.js";
import { generateToken, hashEmail, hashToken } from "./tokens.js";

interface ClientInfo {
  ip: string;
  userAgent: string | null;
}

const normalizeEmail = (email: string) => email.trim().toLowerCase();

@Injectable()
export class AuthService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly sessions: SessionsService,
    private readonly passwords: PasswordService,
    private readonly limiter: StrictRateLimiter,
    private readonly mailer: MailerService,
    @Inject(ConfigService) private readonly config: ConfigService<Env, true>,
  ) {}

  async signUp(input: { email: string; password: string }, client: ClientInfo) {
    const email = normalizeEmail(input.email);
    const limits = AUTH_LIMITS.signUp;
    await this.limiter.hit(`sign-up:ip:${client.ip}`, limits.ip.limit, limits.ip.windowMs);
    await this.limiter.hit(
      `sign-up:email:${hashEmail(email)}`,
      limits.email.limit,
      limits.email.windowMs,
    );

    if (await this.repository.findUserByEmail(email)) throw this.emailInUse();

    const passwordHash = await this.passwords.hash(input.password);
    let user;
    try {
      // The name is a placeholder until onboarding asks for it.
      user = await this.repository.createUser({ email, name: email.split("@")[0], passwordHash });
    } catch (error) {
      // Two sign-ups racing for the same e-mail: the unique index decides.
      if (isUniqueViolation(error)) throw this.emailInUse();
      throw error;
    }

    const token = await this.sessions.create(user.id, client.userAgent);
    return { user: toSessionUser(user), token };
  }

  async signIn(input: { email: string; password: string }, client: ClientInfo) {
    const email = normalizeEmail(input.email);
    const limits = AUTH_LIMITS.signIn;
    await this.limiter.hit(`sign-in:ip:${client.ip}`, limits.ip.limit, limits.ip.windowMs);
    await this.limiter.hit(
      `sign-in:email:${hashEmail(email)}`,
      limits.email.limit,
      limits.email.windowMs,
    );

    const user = await this.repository.findUserByEmail(email);
    const valid = user?.passwordHash
      ? await this.passwords.verify(user.passwordHash, input.password)
      : await this.passwords.verifyAgainstDummy(input.password);
    // Same answer for an unknown e-mail, a wrong password and a Google-only account.
    if (!user || !valid) throw new UnauthorizedException("E-mail ou senha incorretos");

    const token = await this.sessions.create(user.id, client.userAgent);
    return { user: toSessionUser(user), token };
  }

  async signOut(token: string | undefined) {
    if (token) await this.sessions.destroy(token);
  }

  /** Always resolves the same way, whether or not the e-mail has an account. */
  async forgotPassword(input: { email: string }, client: ClientInfo) {
    const email = normalizeEmail(input.email);
    const limits = AUTH_LIMITS.forgotPassword;
    await this.limiter.hit(`forgot:ip:${client.ip}`, limits.ip.limit, limits.ip.windowMs);
    await this.limiter.hit(
      `forgot:email:${hashEmail(email)}`,
      limits.email.limit,
      limits.email.windowMs,
    );

    const user = await this.repository.findUserByEmail(email);
    if (user) await this.sendResetLink(user);
    return { email: input.email };
  }

  /**
   * "Change password" (or "add one" to a Google-only account) from the profile: the same single use
   * link as the recovery flow, sent to the signed-in user's own address.
   */
  async requestPasswordReset(user: { id: string; email: string }) {
    const limits = AUTH_LIMITS.forgotPassword;
    await this.limiter.hit(`forgot:user:${user.id}`, limits.email.limit, limits.email.windowMs);
    await this.sendResetLink(user);
    return { email: user.email };
  }

  /**
   * Starts a change of the login e-mail: a single use link goes to the NEW address. Nothing changes
   * until it is opened. The answer is the same when the address is the current one or belongs to
   * another account (and then nothing is sent), so this cannot be used to find out who has an account.
   */
  async requestEmailChange(user: SessionUser, input: { email: string }) {
    const limits = AUTH_LIMITS.emailChange;
    await this.limiter.hit(`email-change:user:${user.id}`, limits.user.limit, limits.user.windowMs);

    const newEmail = normalizeEmail(input.email);
    const isSame = newEmail === normalizeEmail(user.email);
    if (!isSame && !(await this.repository.findUserByEmail(newEmail))) {
      const token = generateToken();
      await this.repository.replaceEmailChangeToken({
        tokenHash: hashToken(token),
        userId: user.id,
        newEmail,
        expiresAt: new Date(Date.now() + EMAIL_CHANGE_TOKEN_TTL_MS),
      });
      const link = new URL("/confirmar-email", this.config.get("WEB_URL", { infer: true }));
      link.searchParams.set("token", token);
      void this.mailer.sendEmailChange(newEmail, link.toString()).catch(() => undefined);
    }
    return { email: input.email.trim() };
  }

  async checkEmailChangeToken(token: string) {
    const found = await this.repository.findValidEmailChange(hashToken(token));
    if (!found) throw this.linkExpired();
    return { email: found.newEmail };
  }

  /** The link was opened and confirmed. Public: the token is the credential, a session is not needed. */
  async confirmEmailChange(token: string, client: ClientInfo) {
    const limits = AUTH_LIMITS.confirmEmailChange;
    await this.limiter.hit(
      `email-change-confirm:ip:${client.ip}`,
      limits.ip.limit,
      limits.ip.windowMs,
    );

    let changed;
    try {
      changed = await this.repository.consumeEmailChange(hashToken(token));
    } catch (error) {
      if (isUniqueViolation(error)) throw this.emailInUse();
      throw error;
    }
    if (!changed) throw this.linkExpired();

    // To the old address, so a takeover does not go unnoticed.
    void this.mailer.sendEmailChanged(changed.oldEmail, changed.newEmail).catch(() => undefined);
    return { email: changed.newEmail };
  }

  private async sendResetLink(user: { id: string; email: string }) {
    const token = generateToken();
    await this.repository.replaceResetToken({
      tokenHash: hashToken(token),
      userId: user.id,
      expiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
    });
    const link = new URL("/recuperar-senha/nova", this.config.get("WEB_URL", { infer: true }));
    link.searchParams.set("token", token);
    // Not awaited: sending must not change the response time, which would reveal the account.
    void this.mailer.sendPasswordReset(user.email, link.toString()).catch(() => undefined);
  }

  async checkResetToken(token: string) {
    const found = await this.repository.findValidResetToken(hashToken(token));
    if (!found) throw this.linkExpired();
    return { email: found.email };
  }

  async resetPassword(input: { token: string; password: string }, client: ClientInfo) {
    const limits = AUTH_LIMITS.resetPassword;
    await this.limiter.hit(`reset:ip:${client.ip}`, limits.ip.limit, limits.ip.windowMs);

    const passwordHash = await this.passwords.hash(input.password);
    const done = await this.repository.consumeResetToken(hashToken(input.token), passwordHash);
    if (!done) throw this.linkExpired();
    return {};
  }

  private emailInUse() {
    return new ConflictException("Já existe uma conta com este e-mail");
  }

  private linkExpired() {
    return new GoneException("Este link expirou ou já foi usado");
  }
}
