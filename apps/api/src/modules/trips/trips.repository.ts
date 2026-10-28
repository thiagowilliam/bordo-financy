import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { and, desc, eq, getTableColumns, sql } from "drizzle-orm";

import { DATABASE, type Database } from "../../database/database.module.js";
import { expenses, photos, trips } from "../../database/schema/index.js";

export type TripRow = typeof trips.$inferSelect;
export type TripWithCover = TripRow & { coverKey: string | null };
export type TripWithSpent = TripWithCover & { spentCents: number };

/** Every query is scoped by `userId`: a trip id alone never reaches another user's data. */
@Injectable()
export class TripsRepository {
  constructor(@Inject(DATABASE) private readonly database: Database | null) {}

  private get db(): Database {
    if (!this.database) throw new ServiceUnavailableException();
    return this.database;
  }

  /** Newest start date first, with what was spent on each trip. */
  async listWithSpent(userId: string): Promise<TripWithSpent[]> {
    const rows = await this.db
      .select({
        ...getTableColumns(trips),
        coverKey: photos.storageKey,
        spentCents: sql<string>`coalesce(sum(${expenses.amountCents}), 0)`,
      })
      .from(trips)
      .leftJoin(photos, eq(photos.id, trips.coverPhotoId))
      .leftJoin(expenses, eq(expenses.tripId, trips.id))
      .where(eq(trips.userId, userId))
      .groupBy(trips.id, photos.storageKey)
      .orderBy(desc(trips.startDate), desc(trips.id));
    return rows.map((row) => ({ ...row, spentCents: Number(row.spentCents) }));
  }

  async find(userId: string, id: string): Promise<TripWithCover | null> {
    const [row] = await this.db
      .select({ ...getTableColumns(trips), coverKey: photos.storageKey })
      .from(trips)
      .leftJoin(photos, eq(photos.id, trips.coverPhotoId))
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .limit(1);
    return row ?? null;
  }

  async create(values: typeof trips.$inferInsert): Promise<TripRow> {
    const [row] = await this.db.insert(trips).values(values).returning();
    return row;
  }
}
