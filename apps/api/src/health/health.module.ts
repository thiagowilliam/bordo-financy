import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";

import { HealthController } from "./health.controller.js";
import { DatabaseHealthIndicator } from "./database.health.js";
import { RedisHealthIndicator } from "./redis.health.js";

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [RedisHealthIndicator, DatabaseHealthIndicator],
})
export class HealthModule {}
