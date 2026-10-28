import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

import type { SessionUser } from "./session-user.js";

/** The user the auth guard attached to the request. Only valid on non public routes. */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const request = context.switchToHttp().getRequest<FastifyRequest>();
  return request.user as SessionUser;
});
