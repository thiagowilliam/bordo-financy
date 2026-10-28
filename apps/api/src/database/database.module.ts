import { Global, Inject, Injectable, Module, type OnApplicationShutdown } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

import type { Env } from "../config/env.js";
import * as schema from "./schema/index.js";

export const DATABASE = Symbol("DATABASE");
export const DATABASE_CLIENT = Symbol("DATABASE_CLIENT");

export type Database = PostgresJsDatabase<typeof schema>;

/** `null` when DATABASE_URL is not set (development and tests only, production requires it). */
export type DatabaseClient = Sql | null;

@Injectable()
class DatabaseShutdown implements OnApplicationShutdown {
  constructor(@Inject(DATABASE_CLIENT) private readonly client: DatabaseClient) {}

  async onApplicationShutdown() {
    await this.client?.end({ timeout: 5 });
  }
}

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): DatabaseClient => {
        const url = config.get("DATABASE_URL", { infer: true });
        // Connects lazily: nothing happens until the first query.
        return url
          ? postgres(url, { max: config.get("DATABASE_POOL_MAX", { infer: true }) })
          : null;
      },
    },
    {
      provide: DATABASE,
      inject: [DATABASE_CLIENT],
      useFactory: (client: DatabaseClient): Database | null =>
        client ? drizzle(client, { schema, casing: "snake_case" }) : null,
    },
    DatabaseShutdown,
  ],
  exports: [DATABASE, DATABASE_CLIENT],
})
export class DatabaseModule {}
