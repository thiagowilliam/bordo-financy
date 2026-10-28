/** Name of the httpOnly session cookie. The Node backend sets it; the frontend never reads its value. */
export const SESSION_COOKIE = "bordo_session";

/** Where a signed-in user lands after signing in or signing up. */
export const SIGNED_IN_HOME = "/viagens";

export const SIGN_IN_PATH = "/entrar";

/** Routes that need a session. A prefix covers its sub-routes. */
const PROTECTED_PREFIXES = ["/viagens", "/perfil", "/configuracoes", "/onboarding"];

/** Routes only for signed-out users. The landing page too: a returning user goes straight to the trips. */
const GUEST_ONLY_PATHS = ["/", "/entrar", "/criar-conta", "/recuperar-senha"];

const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

type AuthRedirectInput = { pathname: string; search?: string; hasSession: boolean };

/**
 * Optimistic redirect used by `proxy.ts`: it only knows if the session cookie exists, not if it
 * is valid. The backend still validates the session on every API call.
 * Returns the path to redirect to, or `null` to let the request through.
 */
export function resolveAuthRedirect({
  pathname,
  search = "",
  hasSession,
}: AuthRedirectInput): string | null {
  if (!hasSession && PROTECTED_PREFIXES.some((prefix) => matchesPrefix(pathname, prefix))) {
    const next = encodeURIComponent(`${pathname}${search}`);
    return `${SIGN_IN_PATH}?next=${next}`;
  }
  if (hasSession && GUEST_ONLY_PATHS.includes(pathname)) return SIGNED_IN_HOME;
  return null;
}

/**
 * Where to send a user whose session is no longer valid, or `null` when they are already on a
 * signed-out page (no loop).
 */
export function resolveSignInRedirect({
  pathname,
  search = "",
}: Omit<AuthRedirectInput, "hasSession">) {
  if (GUEST_ONLY_PATHS.includes(pathname)) return null;
  return `${SIGN_IN_PATH}?next=${encodeURIComponent(`${pathname}${search}`)}`;
}

/** Accepts only same-origin paths, so `?next=` cannot become an open redirect. */
export function safeRedirectPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return SIGNED_IN_HOME;
  }
  return next;
}
