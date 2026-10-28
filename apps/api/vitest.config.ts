import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globalSetup: ["test/global-setup.ts"],
    // The database tests share one Postgres, so files run one after another.
    fileParallelism: false,
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
  },
  // Nest relies on decorator metadata, which esbuild does not emit. SWC does.
  plugins: [swc.vite({ module: { type: "es6" } })],
});
