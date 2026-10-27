import {
  Global,
  Inject,
  Injectable,
  Logger,
  Module,
  type OnApplicationShutdown,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

import type { Env } from "../../config/env.js";

export const REDIS = Symbol("REDIS");

/** `null` when REDIS_URL is not set (development only, production requires it). */
export type RedisClient = Redis | null;

@Injectable()
class RedisShutdown implements OnApplicationShutdown {
  constructor(@Inject(REDIS) private readonly redis: RedisClient) {}

  async onApplicationShutdown() {
    await this.redis?.quit().catch(() => this.redis?.disconnect());
  }
}

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): RedisClient => {
        const url = config.get("REDIS_URL", { infer: true });
        if (!url) return null;
        const redis = new Redis(url, { maxRetriesPerRequest: 2, enableReadyCheck: true });
        // Without a listener ioredis prints every failed attempt to the console.
        const logger = new Logger("Redis");
        redis.on("error", (error) => logger.warn(error.message));
        return redis;
      },
    },
    RedisShutdown,
  ],
  exports: [REDIS],
})
export class RedisModule {}
