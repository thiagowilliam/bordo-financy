export const env = {
  /** MSW answers `/api/*` while the backend is not ready. */
  apiMocking:
    process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_API_MOCKING !== "disabled",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
} as const;
