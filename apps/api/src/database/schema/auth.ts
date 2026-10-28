import {
  index,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { createdAt, currencyCode, id } from "./columns.js";

export const authProvider = pgEnum("auth_provider", ["EMAIL", "GOOGLE"]);

export const users = pgTable(
  "users",
  {
    id: id(),
    email: text().notNull(),
    name: text().notNull(),
    photoUrl: text(),
    /** Main currency, used to sum trips made in different currencies. */
    currency: currencyCode("currency").notNull().default("BRL"),
    authProvider: authProvider().notNull().default("EMAIL"),
    emailVerifiedAt: timestamp({ withTimezone: true }),
    /** Argon2id hash. Null for Google-only accounts. */
    passwordHash: text(),
    createdAt: createdAt(),
  },
  (table) => [
    // E-mails are compared case insensitively; the app also lowercases before inserting.
    uniqueIndex("users_email_lower_key").on(sql`lower(${table.email})`),
  ],
);

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 of the opaque cookie value. The raw value is never stored. */
    idHash: text().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    userAgent: text(),
    createdAt: createdAt(),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    provider: text().notNull(),
    providerUserId: text().notNull(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerUserId] }),
    index("oauth_accounts_user_id_idx").on(table.userId),
  ],
);

/** A pending e-mail change: the link goes to `newEmail`, and only its hash is kept. */
export const emailChangeTokens = pgTable(
  "email_change_tokens",
  {
    tokenHash: text().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    newEmail: text().notNull(),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    usedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [index("email_change_tokens_user_id_idx").on(table.userId)],
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    /** SHA-256 of the token sent by e-mail. Single use, 1 hour. */
    tokenHash: text().primaryKey(),
    userId: uuid()
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp({ withTimezone: true }).notNull(),
    usedAt: timestamp({ withTimezone: true }),
    createdAt: createdAt(),
  },
  (table) => [index("password_reset_tokens_user_id_idx").on(table.userId)],
);
