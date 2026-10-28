/**
 * Address of the API, for the `/api/*` rewrite and for server-side reads. `BACKEND_URL` wins; in
 * development it defaults to the local API. Production must set it (no default there).
 */
export function backendUrl(): string | undefined {
  return (
    process.env.BACKEND_URL ||
    (process.env.NODE_ENV === "development" ? "http://localhost:3001" : undefined)
  );
}
