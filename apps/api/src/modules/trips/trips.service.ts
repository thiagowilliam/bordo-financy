import { Injectable, NotFoundException } from "@nestjs/common";
import type { z } from "zod";
import type { createTripSchema, tripSchema, tripSummarySchema } from "@bordo/shared/trips";

import { toPhotoUrl } from "../../common/storage/photo-url.js";
import type { SessionUser } from "../auth/session-user.js";
import { TripsRepository, type TripRow, type TripWithCover } from "./trips.repository.js";

type Trip = z.infer<typeof tripSchema>;
type TripSummary = z.infer<typeof tripSummarySchema>;
type CreateTrip = z.infer<typeof createTripSchema>;

const toTrip = (row: TripRow, coverKey: string | null): Trip => ({
  id: row.id,
  name: row.name,
  destination: row.destination,
  startDate: row.startDate,
  endDate: row.endDate,
  budgetInCents: row.budgetCents,
  currency: row.currency,
  coverPhotoUrl: toPhotoUrl(coverKey),
});

@Injectable()
export class TripsService {
  constructor(private readonly repository: TripsRepository) {}

  async list(user: SessionUser): Promise<TripSummary[]> {
    const rows = await this.repository.listWithSpent(user.id);
    return rows.map((row) => ({ ...toTrip(row, row.coverKey), spentInCents: row.spentCents }));
  }

  async get(user: SessionUser, id: string): Promise<Trip> {
    const row: TripWithCover | null = await this.repository.find(user.id, id);
    if (!row) throw new NotFoundException();
    return toTrip(row, row.coverKey);
  }

  async create(user: SessionUser, input: CreateTrip): Promise<Trip> {
    const row = await this.repository.create({
      userId: user.id,
      name: input.name,
      destination: input.destination,
      startDate: input.startDate,
      endDate: input.endDate,
      currency: input.currency,
      budgetCents: input.budgetInCents,
    });
    return toTrip(row, null);
  }
}
