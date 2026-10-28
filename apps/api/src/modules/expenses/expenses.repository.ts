import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { and, asc, desc, eq, gte, ilike, inArray, lte, type SQL } from "drizzle-orm";

import { DATABASE, type Database } from "../../database/database.module.js";
import { categories, expenses, trips } from "../../database/schema/index.js";

export type ExpenseRow = typeof expenses.$inferSelect;
export type ExpenseValues = Omit<typeof expenses.$inferInsert, "id" | "tripId" | "createdAt">;

export interface ExpenseFilters {
  kind?: ExpenseRow["kind"];
  search?: string;
  categories?: string[];
  from?: string;
  to?: string;
  paymentMethod?: ExpenseRow["paymentMethod"];
}

/** `%` and `_` are wildcards in LIKE: a search for "50%" must match the text, not everything. */
const escapeLike = (text: string) => text.replace(/[\\%_]/g, (char) => `\\${char}`);

/** Every query is scoped by the trip, and the trip by the user. Ids alone never reach other data. */
@Injectable()
export class ExpensesRepository {
  constructor(@Inject(DATABASE) private readonly database: Database | null) {}

  private get db(): Database {
    if (!this.database) throw new ServiceUnavailableException();
    return this.database;
  }

  async findTrip(userId: string, tripId: string) {
    const [row] = await this.db
      .select({ id: trips.id, currency: trips.currency })
      .from(trips)
      .where(and(eq(trips.id, tripId), eq(trips.userId, userId)))
      .limit(1);
    return row ?? null;
  }

  async findCategory(userId: string, categoryId: string) {
    const [row] = await this.db
      .select({ id: categories.id, kind: categories.kind, hidden: categories.hidden })
      .from(categories)
      .where(and(eq(categories.id, categoryId), eq(categories.userId, userId)))
      .limit(1);
    return row ?? null;
  }

  async find(tripId: string, id: string) {
    const [row] = await this.db
      .select()
      .from(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.tripId, tripId)))
      .limit(1);
    return row ?? null;
  }

  /** Newest first, like the "Dia a dia" list. */
  list(tripId: string, filters: ExpenseFilters) {
    const conditions: (SQL | undefined)[] = [
      eq(expenses.tripId, tripId),
      filters.kind ? eq(expenses.kind, filters.kind) : undefined,
      filters.search ? ilike(expenses.description, `%${escapeLike(filters.search)}%`) : undefined,
      filters.categories?.length ? inArray(expenses.categoryId, filters.categories) : undefined,
      filters.from ? gte(expenses.spentAt, filters.from) : undefined,
      filters.to ? lte(expenses.spentAt, filters.to) : undefined,
      filters.paymentMethod ? eq(expenses.paymentMethod, filters.paymentMethod) : undefined,
    ];
    return this.db
      .select()
      .from(expenses)
      .where(and(...conditions))
      .orderBy(desc(expenses.spentAt), desc(expenses.createdAt), desc(expenses.id));
  }

  /** Base costs read in booking order: oldest first. */
  listBase(tripId: string) {
    return this.db
      .select()
      .from(expenses)
      .where(and(eq(expenses.tripId, tripId), eq(expenses.kind, "BASE")))
      .orderBy(asc(expenses.spentAt), asc(expenses.createdAt), asc(expenses.id));
  }

  async create(tripId: string, values: ExpenseValues) {
    const [row] = await this.db
      .insert(expenses)
      .values({ ...values, tripId })
      .returning();
    return row;
  }

  async update(tripId: string, id: string, values: ExpenseValues) {
    const [row] = await this.db
      .update(expenses)
      .set(values)
      .where(and(eq(expenses.id, id), eq(expenses.tripId, tripId)))
      .returning();
    return row ?? null;
  }

  async delete(tripId: string, id: string) {
    const rows = await this.db
      .delete(expenses)
      .where(and(eq(expenses.id, id), eq(expenses.tripId, tripId)))
      .returning({ id: expenses.id });
    return rows.length > 0;
  }
}
