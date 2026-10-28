import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";

import { REDIS, type RedisClient } from "../redis/redis.module.js";

/**
 * Fixed window counter for sensitive routes (sign-in, sign-up, password recovery).
 * Unlike the global throttler it **fails closed**: if the storage breaks, the request is refused
 * instead of letting a brute force attempt through.
 */
@Injectable()
export class StrictRateLimiter {
  private readonly logger = new Logger(StrictRateLimiter.name);
  /** Used without Redis (development and tests): one process only. */
  private readonly memory = new Map<string, { count: number; resetAt: number }>();

  constructor(@Inject(REDIS) private readonly redis: RedisClient) {}

  /** Counts one hit on `key`. Throws `429` past `limit` within `windowMs`. */
  async hit(key: string, limit: number, windowMs: number) {
    const { count, retryAfterMs } = await this.increment(`rl:${key}`, windowMs);
    if (count > limit) {
      throw new HttpException(
        "Muitas tentativas. Aguarde um pouco e tente novamente.",
        HttpStatus.TOO_MANY_REQUESTS,
        { cause: { retryAfterMs } },
      );
    }
  }

  private async increment(key: string, windowMs: number) {
    if (!this.redis) return this.incrementInMemory(key, windowMs);
    try {
      const results = await this.redis
        .multi()
        .incr(key)
        .pexpire(key, windowMs, "NX")
        .pttl(key)
        .exec();
      const count = Number(results?.[0]?.[1]);
      const ttl = Number(results?.[2]?.[1]);
      if (!Number.isFinite(count)) throw new Error("unexpected Redis answer");
      return { count, retryAfterMs: ttl > 0 ? ttl : windowMs };
    } catch (error) {
      this.logger.error(`Rate limit storage failed, refusing the request: ${String(error)}`);
      throw new ServiceUnavailableException();
    }
  }

  private incrementInMemory(key: string, windowMs: number) {
    const now = Date.now();
    let entry = this.memory.get(key);
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + windowMs };
      this.memory.set(key, entry);
    }
    entry.count += 1;
    return { count: entry.count, retryAfterMs: entry.resetAt - now };
  }
}
