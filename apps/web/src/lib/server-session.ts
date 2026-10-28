import { cookies } from "next/headers";

import { authUserSchema } from "@bordo/shared/auth";

import { SESSION_COOKIE } from "./auth-routes";
import { backendUrl } from "./backend-url";
import type { z } from "zod";

type SessionUser = z.infer<typeof authUserSchema>;

/**
 * The signed-in user, read on the server with the visitor's session cookie, so the first paint
 * already shows the right name (and not a placeholder). `null` for no session, a stale one or an
 * API that does not answer: the page still renders and the client handles the 401 (the backend
 * clears the stale cookie in that response, which a server-side read cannot do).
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const base = backendUrl();
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!base || !token) return null;

  try {
    const response = await fetch(`${base}/api/auth/session`, {
      headers: { cookie: `${SESSION_COOKIE}=${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return response.ok ? authUserSchema.parse(await response.json()) : null;
  } catch {
    return null;
  }
}
