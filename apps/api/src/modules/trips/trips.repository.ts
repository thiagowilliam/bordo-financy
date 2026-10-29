import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { and, desc, eq, getTableColumns, gt, lt, or, sql } from "drizzle-orm";

import { DATABASE, type Database } from "../../database/database.module.js";
import { expenses, photos, tripBudgetChanges, trips } from "../../database/schema/index.js";

export type TripRow = typeof trips.$inferSelect;
export type TripWithCover = TripRow & { coverKey: string | null };
export type TripWithSpent = TripWithCover & { spentCents: number };
export type BudgetChangeRow = typeof tripBudgetChanges.$inferSelect;
export type TripChanges = Pick<
  typeof trips.$inferInsert,
  "name" | "destination" | "startDate" | "endDate" | "currency" | "budgetCents"
>;

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

  async lastBudgetChange(tripId: string): Promise<BudgetChangeRow | null> {
    const [row] = await this.db
      .select()
      .from(tripBudgetChanges)
      .where(eq(tripBudgetChanges.tripId, tripId))
      .orderBy(desc(tripBudgetChanges.createdAt), desc(tripBudgetChanges.id))
      .limit(1);
    return row ?? null;
  }

  async countExpenses(tripId: string): Promise<number> {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(expenses)
      .where(eq(expenses.tripId, tripId));
    return row.total;
  }

  async countExpensesOutside(tripId: string, startDate: string, endDate: string): Promise<number> {
    const [row] = await this.db
      .select({ total: sql<number>`count(*)::int` })
      .from(expenses)
      .where(
        and(
          eq(expenses.tripId, tripId),
          eq(expenses.kind, "DAILY"),
          or(lt(expenses.spentAt, startDate), gt(expenses.spentAt, endDate)),
        ),
      );
    return row.total;
  }

  /** Updates the trip and, when the budget moved, records the change in the same transaction. */
  async update(userId: string, id: string, changes: TripChanges): Promise<TripRow | null> {
    return this.db.transaction(async (tx) => {
      const [current] = await tx
        .select({ budgetCents: trips.budgetCents })
        .from(trips)
        .where(and(eq(trips.id, id), eq(trips.userId, userId)))
        .for("update");
      if (!current) return null;
      const [row] = await tx
        .update(trips)
        .set(changes)
        .where(and(eq(trips.id, id), eq(trips.userId, userId)))
        .returning();
      if (current.budgetCents !== changes.budgetCents) {
        await tx.insert(tripBudgetChanges).values({
          tripId: id,
          fromCents: current.budgetCents,
          toCents: changes.budgetCents,
        });
      }
      return row;
    });
  }

  /** Storage keys of the trip photos, read before the rows are gone with the trip. */
  async photoKeys(tripId: string): Promise<string[]> {
    const rows = await this.db
      .select({ key: photos.storageKey })
      .from(photos)
      .where(eq(photos.tripId, tripId));
    return rows.map((row) => row.key);
  }

  /** Expenses, photos and budget changes go with the trip (cascade). */
  async delete(userId: string, id: string): Promise<boolean> {
    const rows = await this.db
      .delete(trips)
      .where(and(eq(trips.id, id), eq(trips.userId, userId)))
      .returning({ id: trips.id });
    return rows.length > 0;
  }
}
