import { defineConfig } from "tsdown";

// One entry per domain, so consumers import `@bordo/shared/trips` and so on.
// `exports: true` keeps the package.json `exports` map in sync with the entries.
export default defineConfig({
  entry: {
    auth: "src/auth/index.ts",
    "base-costs": "src/base-costs/index.ts",
    categories: "src/categories/index.ts",
    common: "src/common/index.ts",
    expenses: "src/expenses/index.ts",
    photos: "src/photos/index.ts",
    profile: "src/profile/index.ts",
    trips: "src/trips/index.ts",
  },
  format: "esm",
  dts: true,
  clean: true,
  exports: true,
});
