import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  images: {
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  // With a real backend, `/api/*` is proxied to it so the session cookie stays first-party
  // (no CORS). Without BACKEND_URL the requests stay in Next, where MSW answers them in development.
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL;
    return backendUrl ? [{ source: "/api/:path*", destination: `${backendUrl}/api/:path*` }] : [];
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
