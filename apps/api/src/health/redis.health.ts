import { Inject, Injectable } from "@nestjs/common";
import { HealthIndicatorService } from "@nestjs/terminus";

import { REDIS, type RedisClient } from "../common/redis/redis.module.js";

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(REDIS) private readonly redis: RedisClient,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    // Without REDIS_URL (development) there is nothing to check.
    if (!this.redis) return indicator.up({ configured: false });

    try {
      await this.redis.ping();
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: error instanceof Error ? error.message : "ping failed" });
    }
  }
}
