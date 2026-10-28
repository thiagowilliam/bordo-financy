import { defineConfig } from "drizzle-kit";

import "./src/config/load-env.js";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/database/schema/index.ts",
  out: "./migrations",
  dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://bordo:bordo@localhost:5432/bordo" },
  casing: "snake_case",
  strict: true,
});
