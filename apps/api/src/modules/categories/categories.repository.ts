import { Inject, Injectable, NotFoundException, ServiceUnavailableException } from "@nestjs/common";
import { and, asc, eq, sql } from "drizzle-orm";

import { DATABASE, type Database } from "../../database/database.module.js";
import { categories, expenses } from "../../database/schema/index.js";

export type CategoryRow = typeof categories.$inferSelect;

/** Every query is scoped by `userId`: a category id alone never reaches another user's data. */
@Injectable()
export class CategoriesRepository {
  constructor(@Inject(DATABASE) private readonly database: Database | null) {}

  private get db(): Database {
    if (!this.database) throw new ServiceUnavailableException();
    return this.database;
  }

  /** Daily first (enum order), then in creation order: ids are time ordered uuids. */
  list(userId: string) {
    return this.db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId))
      .orderBy(asc(categories.kind), asc(categories.id));
  }

  async find(userId: string, id: string) {
    const [row] = await this.db
      .select()
      .from(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .limit(1);
    return row ?? null;
  }

  async create(values: typeof categories.$inferInsert) {
    const [row] = await this.db.insert(categories).values(values).returning();
    return row;
  }

  async update(
    userId: string,
    id: string,
    values: Partial<Pick<CategoryRow, "name" | "icon" | "color" | "hidden">>,
  ) {
    const [row] = await this.db
      .update(categories)
      .set(values)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)))
      .returning();
    return row ?? null;
  }

  /**
   * Moves the expenses of a category to another one and deletes it, in one transaction. Returns how
   * many expenses moved. Throws (and rolls the move back) when the category is not the user's.
   */
  async deleteMoving(userId: string, id: string, moveTo: string | undefined) {
    return this.db.transaction(async (tx) => {
      let moved = 0;
      if (moveTo) {
        const result = await tx
          .update(expenses)
          .set({ categoryId: moveTo })
          .where(eq(expenses.categoryId, id))
          .returning({ id: expenses.id });
        moved = result.length;
      }
      const deleted = await tx
        .delete(categories)
        .where(and(eq(categories.id, id), eq(categories.userId, userId)))
        .returning({ id: categories.id });
      if (deleted.length === 0) throw new NotFoundException();
      return moved;
    });
  }

  async countExpenses(categoryId: string) {
    const [row] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(expenses)
      .where(eq(expenses.categoryId, categoryId));
    return row.count;
  }
}
