import { NextResponse, type NextRequest } from "next/server";

import { resolveAuthRedirect, SESSION_COOKIE } from "@/lib/auth-routes";
import { env } from "@/lib/env";

/**
 * Optimistic auth check: it only looks at the session cookie to redirect early. The backend
 * validates the session on every API call, so this is a convenience and not the security boundary.
 */
export function proxy(request: NextRequest) {
  // MSW cannot set the httpOnly cookie, so the guard would lock everyone out while mocking.
  if (env.apiMocking) return NextResponse.next();

  const redirect = resolveAuthRedirect({
    pathname: request.nextUrl.pathname,
    search: request.nextUrl.search,
    hasSession: request.cookies.has(SESSION_COOKIE),
  });
  return redirect ? NextResponse.redirect(new URL(redirect, request.url)) : NextResponse.next();
}

export const config = {
  // Everything except API, Next internals and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
