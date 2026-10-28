import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_FILTER, APP_GUARD, APP_PIPE } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerStorageRedisService } from "@nest-lab/throttler-storage-redis";
import { ZodValidationPipe } from "nestjs-zod";
import { LoggerModule } from "nestjs-pino";

import { AllExceptionsFilter } from "./common/filters/all-exceptions.filter.js";
import { RateLimitModule } from "./common/rate-limit/rate-limit.module.js";
import { JsonContentTypeGuard } from "./common/guards/json-content-type.guard.js";
import { SafeThrottlerGuard } from "./common/guards/safe-throttler.guard.js";
import { REDIS, type RedisClient } from "./common/redis/redis.module.js";
import { RedisModule } from "./common/redis/redis.module.js";
import { type Env, validateEnv } from "./config/env.js";
import { DatabaseModule } from "./database/database.module.js";
import { AuthGuard } from "./modules/auth/auth.guard.js";
import { AuthModule } from "./modules/auth/auth.module.js";
import { CategoriesModule } from "./modules/categories/categories.module.js";
import { ProfileModule } from "./modules/profile/profile.module.js";
import { HealthModule } from "./health/health.module.js";

const HEALTH_URL = /^(\/api)?\/health(\/|\?|$)/;

@Module({
  imports: [
    // `.env` is loaded by config/load-env.ts (outside production). Reading it here too would leak a
    // developer's local file into the tests.
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      ignoreEnvFile: true,
      validate: validateEnv,
    }),
    RedisModule,
    DatabaseModule,
    RateLimitModule,
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => {
        const isDevelopment = config.get("NODE_ENV", { infer: true }) === "development";
        return {
          pinoHttp: {
            level: config.get("LOG_LEVEL", { infer: true }),
            redact: {
              paths: [
                "req.headers.authorization",
                "req.headers.cookie",
                'res.headers["set-cookie"]',
              ],
              censor: "[redacted]",
            },
            autoLogging: {
              // Probes hit these every few seconds. Nest may have stripped the global prefix by now.
              ignore: (req) =>
                HEALTH_URL.test((req as { originalUrl?: string }).originalUrl ?? req.url ?? ""),
            },
            transport: isDevelopment
              ? {
                  target: "pino-pretty",
                  options: { singleLine: true, translateTime: "SYS:HH:MM:ss" },
                }
              : undefined,
          },
        };
      },
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService, REDIS],
      useFactory: (config: ConfigService<Env, true>, redis: RedisClient) => ({
        throttlers: [
          {
            name: "default",
            ttl: config.get("THROTTLE_TTL_MS", { infer: true }),
            limit: config.get("THROTTLE_LIMIT", { infer: true }),
          },
        ],
        // Shared storage so the count holds across instances. In-memory (the default) only for local development.
        storage: redis ? new ThrottlerStorageRedisService(redis) : undefined,
      }),
    }),
    HealthModule,
    AuthModule,
    ProfileModule,
    CategoriesModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    { provide: APP_PIPE, useClass: ZodValidationPipe },
    // Guards run in this order: rate limit first, then content type, then session.
    { provide: APP_GUARD, useClass: SafeThrottlerGuard },
    { provide: APP_GUARD, useClass: JsonContentTypeGuard },
    // Last: cheap checks first. Every route needs a session unless it is marked `@Public()`.
    { provide: APP_GUARD, useClass: AuthGuard },
  ],
})
export class AppModule {}
