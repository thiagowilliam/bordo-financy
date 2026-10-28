import { resolve } from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { Redis } from "ioredis";
import postgres from "postgres";
import type { TestProject } from "vitest/node";

declare module "vitest" {
  export interface ProvidedContext {
    testDatabaseUrl: string | null;
    testRedisUrl: string | null;
  }
}

const DEFAULT_URL = "postgres://bordo:bordo@localhost:5432/bordo_test";
const DEFAULT_REDIS_URL = "redis://localhost:6379";

/** True when a Redis answers at `url`. */
async function redisReachable(url: string) {
  const redis = new Redis(url, {
    lazyConnect: true,
    maxRetriesPerRequest: 0,
    retryStrategy: () => null,
  });
  redis.on("error", () => undefined);
  try {
    await redis.connect();
    return (await redis.ping()) === "PONG";
  } catch {
    return false;
  } finally {
    redis.disconnect();
  }
}

/**
 * Creates the scratch database `bordo_test` (if needed) and applies the migrations to it, so the
 * integration tests run against the real schema, and checks for a Redis for the queue tests.
 * Without a reachable Postgres or Redis those tests are skipped, unless `REQUIRE_DATABASE=1` (CI),
 * where a missing service must fail the run.
 */
export default async function setup(project: TestProject) {
  const required = process.env.REQUIRE_DATABASE === "1";
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
    if (required) throw error;
    console.warn(`\nPostgres not reachable, database tests are skipped (${String(error)})\n`);
    project.provide("testDatabaseUrl", null);
  }

  const redisUrl = process.env.TEST_REDIS_URL ?? DEFAULT_REDIS_URL;
  if (await redisReachable(redisUrl)) {
    project.provide("testRedisUrl", redisUrl);
  } else {
    if (required) throw new Error(`Redis not reachable at ${redisUrl}`);
    console.warn("\nRedis not reachable, the mail queue tests are skipped\n");
    project.provide("testRedisUrl", null);
  }
}
