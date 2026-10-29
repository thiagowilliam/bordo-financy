import { sql } from "drizzle-orm";
import {
  type AnyPgColumn,
  boolean,
  check,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
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

/**
 * Every user owns their categories, defaults included: each account gets its own copy of the
 * defaults at sign up (`DEFAULT_CATEGORIES`), so editing, hiding or counting one never touches
 * another user's data.
 */
export const categories = pgTable(
  "categories",
  {
    id: id(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text().notNull(),
    /** Name from `categoryIconNameSchema` in `@bordo/shared/categories`. */
    icon: text().notNull(),
    /** Index of the `chart-N` token. */
    color: smallint().notNull(),
    kind: expenseKind().notNull(),
    /** Came with the account. It can be hidden and edited, never deleted. */
    isDefault: boolean().notNull().default(false),
    /** Not offered for new expenses; existing ones keep it. */
    hidden: boolean().notNull().default(false),
    createdAt: createdAt(),
  },
  (table) => [
    index("categories_user_id_idx").on(table.userId),
    check("categories_color_range", sql`${table.color} between 1 and 8`),
  ],
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
    // Restrict: a category in use cannot be deleted. Deleting a whole user therefore removes their
    // trips (and expenses) first, see `ProfileRepository.deleteUser`.
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

/** One row per budget change, so the overview can say what the budget was and when it moved. */
export const tripBudgetChanges = pgTable(
  "trip_budget_changes",
  {
    id: id(),
    tripId: uuid()
      .notNull()
      .references(() => trips.id, { onDelete: "cascade" }),
    fromCents: cents("from_cents").notNull(),
    toCents: cents("to_cents").notNull(),
    createdAt: createdAt(),
  },
  (table) => [index("trip_budget_changes_trip_id_idx").on(table.tripId, table.createdAt)],
);
