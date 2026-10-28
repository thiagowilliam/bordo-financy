import type { FastifyReply } from "fastify";

import { SESSION_COOKIE, SESSION_TTL_MS } from "./auth.constants.js";

/** `Secure` only in production: plain http on localhost is how development runs. */
const secure = () => process.env.NODE_ENV === "production";

export function setSessionCookie(reply: FastifyReply, token: string) {
  reply.setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secure(),
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_MS / 1000,
  });
}

export function clearSessionCookie(reply: FastifyReply) {
  reply.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: secure(),
    sameSite: "lax",
    path: "/",
  });
}
