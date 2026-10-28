import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "./auth.js";
import { cents, createdAt, currencyCode, id } from "./columns.js";

export const expenseKind = pgEnum("expense_kind", ["DAILY", "BASE"]);

export const paymentMethod = pgEnum("payment_method", [
  "CASH",
  "PIX",
  "DEBIT",
  "CREDIT",
  "INTERNATIONAL_CARD",
]);

export const categories = pgTable(
  "categories",
  {
    id: id(),
    /** Null means a default category, shared by every user. */
    userId: uuid().references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    /** Name from `categoryIconNameSchema` in `@bordo/shared/categories`. */
    icon: text().notNull(),
    /** Index of the `chart-N` token. */
    color: smallint().notNull(),
    kind: expenseKind().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("categories_user_id_idx").on(table.userId),
    check("categories_color_range", sql`${table.color} between 1 and 8`),
  ],
);

/** Categories a user hid. A default category is shared, so hiding it has to be per user. */
export const hiddenCategories = pgTable(
  "hidden_categories",
  {
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    categoryId: uuid()
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.categoryId] })],
);

export const trips = pgTable(
  "trips",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    destination: text().notNull(),
    startDate: date({ mode: "string" }).notNull(),
    endDate: date({ mode: "string" }).notNull(),
    currency: currencyCode("currency").notNull(),
    budgetCents: cents("budget_cents").notNull(),
    coverPhotoId: uuid().references((): AnyPgColumn => photos.id, { onDelete: "set null" }),
    createdAt: createdAt(),
  },
  (table) => [
    index("trips_user_id_idx").on(table.userId),
    check("trips_dates_order", sql`${table.endDate} >= ${table.startDate}`),
    check("trips_budget_non_negative", sql`${table.budgetCents} >= 0`),
  ],
);

export const expenses = pgTable(
  "expenses",
  {
    id: id(),
    tripId: uuid()
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    kind: expenseKind().notNull(),
    // Deleting a category moves its expenses first (see `deletedCategorySchema.movedExpenses`).
    categoryId: uuid()
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    paymentMethod: paymentMethod().notNull(),
    amountCents: cents("amount_cents").notNull(),
    currency: currencyCode("currency").notNull(),
    spentAt: date({ mode: "string" }).notNull(),
    description: text().notNull(),
    createdAt: createdAt(),
  },
  (table) => [
    index("expenses_trip_id_spent_at_idx").on(table.tripId, table.spentAt),
    index("expenses_category_id_idx").on(table.categoryId),
    check("expenses_amount_positive", sql`${table.amountCents} > 0`),
  ],
);

export const photos = pgTable(
  "photos",
  {
    id: id(),
    tripId: uuid()
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    name: text().notNull(),
    /** Object storage key. The public URL is derived from it. */
    storageKey: text().notNull(),
    width: integer(),
    height: integer(),
    createdAt: createdAt(),
  },
  (table) => [index("photos_trip_id_idx").on(table.tripId)],
);
