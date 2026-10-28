import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { and, asc, countDistinct, eq, sql } from "drizzle-orm";

import { DATABASE, type Database } from "../../database/database.module.js";
import { expenses, photos, trips, users } from "../../database/schema/index.js";
import type { UserRow } from "../auth/auth.repository.js";

/** The only place that talks to Drizzle for the profile: account data, history and export. */
@Injectable()
export class ProfileRepository {
  constructor(@Inject(DATABASE) private readonly database: Database | null) {}

  private get db(): Database {
    if (!this.database) throw new ServiceUnavailableException();
    return this.database;
  }

  async findUser(userId: string): Promise<UserRow | null> {
    const [user] = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
    return user ?? null;
  }

  async updateUser(userId: string, values: { name: string; currency: string }) {
    const [user] = await this.db.update(users).set(values).where(eq(users.id, userId)).returning();
    return user ?? null;
  }

  /**
   * Cascades to sessions, tokens, trips (with their expenses and photos) and categories. Trips go
   * first: an expense restricts its category, and the cascade from the user would otherwise try to
   * delete the categories while the expenses still exist.
   */
  async deleteUser(userId: string) {
    await this.db.transaction(async (tx) => {
      await tx.delete(trips).where(eq(trips.userId, userId));
      await tx.delete(users).where(eq(users.id, userId));
    });
  }

  /** Replaces the profile photo. Returns the updated user and what the photo was before. */
  async setPhoto(userId: string, photoUrl: string | null) {
    return this.db.transaction(async (tx) => {
      const [before] = await tx
        .select({ photoUrl: users.photoUrl })
        .from(users)
        .where(eq(users.id, userId))
        .for("update");
      const [user] = await tx
        .update(users)
        .set({ photoUrl })
        .where(eq(users.id, userId))
        .returning();
      return { user: user ?? null, previous: before?.photoUrl ?? null };
    });
  }

  /** Every stored file of the user: the profile photo and the photos of their trips. */
  async storedFileKeys(userId: string): Promise<string[]> {
    const rows = await this.db
      .select({ key: photos.storageKey })
      .from(photos)
      .innerJoin(trips, eq(trips.id, photos.tripId))
      .where(eq(trips.userId, userId));
    const [user] = await this.db
      .select({ photoUrl: users.photoUrl })
      .from(users)
      .where(eq(users.id, userId));
    return [...rows.map((row) => row.key), ...(user?.photoUrl ? [user.photoUrl] : [])];
  }

  /** Trips, days (both ends counted) and distinct destinations of the user. */
  async tripTotals(userId: string) {
    const [row] = await this.db
      .select({
        trips: sql<number>`count(*)::int`,
        days: sql<number>`coalesce(sum(${trips.endDate} - ${trips.startDate} + 1), 0)::int`,
        destinations: countDistinct(sql`lower(btrim(${trips.destination}))`),
      })
      .from(trips)
      .where(eq(trips.userId, userId));
    return row;
  }

  /** Sum of the user's expenses made in `currency`. Other currencies need exchange rates. */
  async totalSpentIn(userId: string, currency: string) {
    const [row] = await this.db
      .select({ total: sql<number>`coalesce(sum(${expenses.amountCents}), 0)::bigint` })
      .from(expenses)
      .innerJoin(trips, eq(trips.id, expenses.tripId))
      .where(and(eq(trips.userId, userId), eq(expenses.currency, currency)));
    return Number(row.total);
  }

  /** Every expense of the user's trips, oldest first. */
  exportRows(userId: string) {
    return this.db
      .select({
        trip: trips.name,
        date: expenses.spentAt,
        kind: expenses.kind,
        description: expenses.description,
        amountCents: expenses.amountCents,
        currency: expenses.currency,
      })
      .from(expenses)
      .innerJoin(trips, eq(trips.id, expenses.tripId))
      .where(eq(trips.userId, userId))
      .orderBy(asc(trips.startDate), asc(expenses.spentAt), asc(expenses.createdAt));
  }
}
