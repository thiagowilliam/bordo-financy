import { Inject, Injectable } from "@nestjs/common";
import { HealthIndicatorService } from "@nestjs/terminus";

import { DATABASE_CLIENT, type DatabaseClient } from "../database/database.module.js";

@Injectable()
export class DatabaseHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    @Inject(DATABASE_CLIENT) private readonly client: DatabaseClient,
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);
    // Without DATABASE_URL (development, tests) there is nothing to check.
    if (!this.client) return indicator.up({ configured: false });

    try {
      await this.client`select 1`;
      return indicator.up();
    } catch (error) {
      return indicator.down({ message: error instanceof Error ? error.message : "query failed" });
    }
  }
}
