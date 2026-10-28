import { defineConfig } from "vitest/config";

/**
 * Contract test: runs the web app's own API client functions (the ones the browser uses, with their
 * Zod schemas) against a running API. Not part of `pnpm test`: it needs the servers up.
 *   pnpm dev:api                       # and, to include the Next rewrite, pnpm dev
 *   pnpm --filter @bordo/web test:contract
 * `CONTRACT_API_URL` is the address to call: the web app (default, goes through the rewrite) or the API.
 */
const apiUrl = process.env.CONTRACT_API_URL ?? "http://localhost:3000";

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    environment: "node",
    include: ["src/contract/**/*.contract.ts"],
    env: { NEXT_PUBLIC_API_BASE_URL: apiUrl },
    testTimeout: 30_000,
    fileParallelism: false,
  },
});
