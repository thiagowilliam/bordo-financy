import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
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
