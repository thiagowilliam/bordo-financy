import { isServer, QueryCache, QueryClient } from "@tanstack/react-query";

import { ApiError } from "./api-client";
import { resolveSignInRedirect } from "./auth-routes";

/**
 * An expired or revoked session answers 401 on any query: send the user to sign in and bring them
 * back afterwards. The backend clears the stale cookie on that same response, so the proxy will not
 * bounce them back to the app.
 */
function handleUnauthorized(error: Error) {
  if (isServer || !(error instanceof ApiError) || error.status !== 401) return;
  const { pathname, search } = window.location;
  const target = resolveSignInRedirect({ pathname, search });
  if (target) window.location.assign(target);
}

function makeQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleUnauthorized }),
    defaultOptions: {
      queries: { staleTime: 60 * 1000, refetchOnWindowFocus: false },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

/** One client per request on the server, a singleton in the browser. */
export function getQueryClient() {
  if (isServer) return makeQueryClient();
  browserQueryClient ??= makeQueryClient();
  return browserQueryClient;
}
