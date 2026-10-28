import "../config/load-env.js";

import { resolve } from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

/**
 * Applies pending migrations. A separate deploy step, never run on API boot: several instances
 * starting together would race. From `src/database` or `dist/database`, `../../migrations` is the same folder.
 */
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required to run migrations");
  process.exit(1);
}

const client = postgres(url, { max: 1 });
try {
  await migrate(drizzle(client), {
    migrationsFolder: resolve(import.meta.dirname, "../../migrations"),
  });
  console.log("Migrations applied");
} finally {
  await client.end();
}
