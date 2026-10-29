import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

import { backendUrl } from "./src/lib/backend-url";

const nextConfig: NextConfig = {
  // Self-contained server for the Docker image. The tracing root is the repo root, so files of
  // `packages/shared` (read through a `paths` alias) are part of the trace.
  output: "standalone",
  outputFileTracingRoot: fileURLToPath(new URL("../..", import.meta.url)),
  reactCompiler: true,
  typedRoutes: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // `/api/*` is proxied to the backend so the session cookie stays first-party (no CORS).
  async rewrites() {
    const backend = backendUrl();
    return backend ? [{ source: "/api/:path*", destination: `${backend}/api/:path*` }] : [];
  },
  turbopack: {
    // msw/browser has a `node: null` export condition, which breaks the SSR pass of the client-only MSW bootstrap.
    resolveAlias: { "msw/browser": "./node_modules/msw/lib/browser/index.js" },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
