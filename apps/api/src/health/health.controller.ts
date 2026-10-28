import { Controller, Get } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import { HealthCheck, HealthCheckService } from "@nestjs/terminus";

import { DatabaseHealthIndicator } from "./database.health.js";
import { RedisHealthIndicator } from "./redis.health.js";

@Controller("health")
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly redis: RedisHealthIndicator,
    private readonly database: DatabaseHealthIndicator,
  ) {}

  /** Liveness: the process is up. Used by the container restart policy. */
  @Get()
  @HealthCheck()
  live() {
    return this.health.check([]);
  }

  /** Readiness: dependencies answer. Used by the load balancer to route traffic. */
  @Get("ready")
  @HealthCheck()
  ready() {
    return this.health.check([
      () => this.redis.isHealthy("redis"),
      () => this.database.isHealthy("database"),
    ]);
  }
}
