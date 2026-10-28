import { resolve } from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    testDatabaseUrl: string | null;
  }
}

const DEFAULT_URL = "postgres://bordo:bordo@localhost:5432/bordo_test";

/**
 * Creates the scratch database `bordo_test` (if needed) and applies the migrations to it, so the
 * integration tests run against the real schema. Without a reachable Postgres they are skipped,
 * unless `REQUIRE_DATABASE=1` (CI), where a missing database must fail the run.
 */
export default async function setup(project: TestProject) {
  const url = new URL(process.env.TEST_DATABASE_URL ?? DEFAULT_URL);
  const database = url.pathname.slice(1);
  const admin = new URL(url);
  admin.pathname = "/postgres";

  try {
    const adminClient = postgres(admin.toString(), { max: 1, connect_timeout: 3 });
    try {
      const existing = await adminClient`select 1 from pg_database where datname = ${database}`;
      if (existing.length === 0) await adminClient.unsafe(`create database "${database}"`);
    } finally {
      await adminClient.end();
    }

    const client = postgres(url.toString(), { max: 1, connect_timeout: 3 });
    try {
      await migrate(drizzle(client), {
        migrationsFolder: resolve(import.meta.dirname, "../migrations"),
      });
    } finally {
      await client.end();
    }
    project.provide("testDatabaseUrl", url.toString());
  } catch (error) {
    if (process.env.REQUIRE_DATABASE === "1") throw error;
    console.warn(`\nPostgres not reachable, database tests are skipped (${String(error)})\n`);
    project.provide("testDatabaseUrl", null);
  }
}
