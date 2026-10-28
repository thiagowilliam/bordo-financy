import type { z } from "zod";
import type { authUserSchema } from "@bordo/shared/auth";
import type { FastifyRequest } from "fastify";

/** The signed-in user, in the shape the web app expects from `GET /api/auth/session`. */
export type SessionUser = z.infer<typeof authUserSchema>;

declare module "fastify" {
  interface FastifyRequest {
    user?: SessionUser;
  }
}

export type AuthenticatedRequest = FastifyRequest & { user: SessionUser };
