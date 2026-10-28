import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyReply, FastifyRequest } from "fastify";

import { IS_PUBLIC } from "./public.decorator.js";
import { SESSION_COOKIE } from "./auth.constants.js";
import { clearSessionCookie, setSessionCookie } from "./session-cookie.js";
import { SessionsService } from "./sessions.service.js";

/** Global guard: every route needs a valid session unless it is marked `@Public()`. */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly sessions: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const http = context.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const token = request.cookies?.[SESSION_COOKIE];
    if (!token) throw new UnauthorizedException();

    const session = await this.sessions.validate(token);
    if (!session) {
      // A stale cookie would keep the web proxy treating the visitor as signed in (and sending
      // them away from the sign in page). Drop it together with the 401.
      clearSessionCookie(http.getResponse<FastifyReply>());
      throw new UnauthorizedException();
    }

    request.user = session.user;
    if (session.refreshed) setSessionCookie(http.getResponse<FastifyReply>(), token);
    return true;
  }
}
