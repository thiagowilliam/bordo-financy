export const env = {
  /** Opt in (`NEXT_PUBLIC_API_MOCKING=enabled`, development only): MSW answers `/api/*` instead of the API. */
  apiMocking:
    process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING === "enabled",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
} as const;
