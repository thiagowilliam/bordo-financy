import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

import { SESSION_COOKIE } from "./auth.constants.js";
import { decodeFlowState, encodeFlowState, GoogleAuthService } from "./google-auth.service.js";
import { Public } from "./public.decorator.js";
import { setSessionCookie } from "./session-cookie.js";
import { SessionsService } from "./sessions.service.js";

const FLOW_COOKIE = "bordo_oauth";
const FLOW_COOKIE_PATH = "/api/auth/google";
const FLOW_TTL_SECONDS = 10 * 60;

/** Nest sets 200 on GET handlers before they run, so the status has to be explicit. */
const go = (reply: FastifyReply, url: string) => reply.redirect(url, 302);

const clientOf = (request: FastifyRequest) => ({
  ip: request.ip,
  userAgent: request.headers["user-agent"] ?? null,
});

const flowCookieOptions = () => ({
  httpOnly: true,
  // Not `Strict`: the callback is a top level navigation coming from Google.
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: FLOW_COOKIE_PATH,
});

/** Browser navigations, not fetches: both routes answer redirects, never JSON. */
@ApiTags("Auth")
@Public()
@Controller("auth/google")
export class GoogleAuthController {
  constructor(
    private readonly google: GoogleAuthService,
    private readonly sessions: SessionsService,
  ) {}

  @ApiOperation({
    summary: "Start Google sign-in. Browser navigation, not a fetch: answers a redirect to Google",
  })
  @ApiQuery({
    name: "next",
    required: false,
    description: "Same-origin path to land on afterwards.",
  })
  @ApiQuery({
    name: "link",
    required: false,
    description: "`1` connects Google to the signed-in account instead of signing in.",
  })
  @ApiResponse({
    status: 302,
    description: "Redirect to Google, or to `/entrar?error=google` when Google sign-in is off.",
  })
  @Get()
  async start(
    @Query("next") next: string | undefined,
    @Query("link") link: string | undefined,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const isLink = link === "1";
    if (!this.google.enabled) {
      return go(reply, this.google.failureUrl({ link: isLink, next: next ?? "/perfil" }));
    }
    try {
      // Connecting only makes sense for someone already signed in.
      if (isLink) {
        const token = request.cookies?.[SESSION_COOKIE];
        if (!token || !(await this.sessions.validate(token))) {
          return go(reply, this.google.failureUrl(null));
        }
      }
      const { url, flow } = await this.google.start({ next, link: isLink }, clientOf(request));
      reply.setCookie(FLOW_COOKIE, encodeFlowState(flow), {
        ...flowCookieOptions(),
        maxAge: FLOW_TTL_SECONDS,
      });
      return go(reply, url);
    } catch {
      return go(
        reply,
        this.google.failureUrl(isLink ? { link: true, next: next ?? "/perfil" } : null),
      );
    }
  }

  @ApiOperation({
    summary: "Google redirects back here. Sets the session cookie and redirects to the web app",
  })
  @ApiResponse({
    status: 302,
    description:
      "Redirect to `next` (new users to `/onboarding`), or to `/entrar?error=google` or `?error=account-exists`.",
  })
  @Get("callback")
  async callback(
    @Query() query: { code?: string; state?: string; error?: string },
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ) {
    const flow = decodeFlowState(request.cookies?.[FLOW_COOKIE]);
    // Single use: whatever happens next, this flow is over.
    reply.clearCookie(FLOW_COOKIE, flowCookieOptions());

    const result = await this.google.finish(
      query,
      flow,
      request.cookies?.[SESSION_COOKIE],
      clientOf(request),
    );
    if (result.type === "session") setSessionCookie(reply, result.token);
    return go(reply, result.path);
  }
}
