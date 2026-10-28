import { Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";
import { and, eq, gt, isNull, sql } from "drizzle-orm";

import { DATABASE, type Database } from "../../database/database.module.js";
import { toPhotoUrl } from "../../common/storage/photo-url.js";
import { DEFAULT_CATEGORIES } from "../../database/default-categories.js";
import {
  categories,
  emailChangeTokens,
  passwordResetTokens,
  sessions,
  users,
} from "../../database/schema/index.js";
import type { SessionUser } from "./session-user.js";

export type UserRow = typeof users.$inferSelect;

/** Maps a row to what the web app reads as the profile. */
export function toSessionUser(user: UserRow): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerifiedAt !== null,
    photoUrl: toPhotoUrl(user.photoUrl),
    currency: user.currency as SessionUser["currency"],
    hasPassword: user.passwordHash !== null,
    // Filled in when Google sign-in lands and stores the connected account's e-mail.
    googleEmail: null,
    createdAt: user.createdAt.toISOString().slice(0, 10),
  };
}

/** The only place that talks to Drizzle for users, sessions and recovery tokens. */
@Injectable()
export class AuthRepository {
  constructor(@Inject(DATABASE) private readonly database: Database | null) {}

  private get db(): Database {
    if (!this.database) throw new ServiceUnavailableException();
    return this.database;
  }

  async findUserByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(sql`lower(${users.email}) = ${email.toLowerCase()}`)
      .limit(1);
    return user ?? null;
  }

  async createUser(values: { email: string; name: string; passwordHash: string }) {
    // The account and its own copy of the default categories, or neither.
    return this.db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values(values).returning();
      await tx
        .insert(categories)
        .values(
          DEFAULT_CATEGORIES.map((category) => ({ ...category, userId: user.id, isDefault: true })),
        );
      return user;
    });
  }

  async setPassword(userId: string, passwordHash: string) {
    await this.db.update(users).set({ passwordHash }).where(eq(users.id, userId));
  }

  async createSession(values: {
    idHash: string;
    userId: string;
    expiresAt: Date;
    userAgent: string | null;
  }) {
    await this.db.insert(sessions).values(values);
  }

  /** The session and its user, if the session has not expired. */
  async findActiveSession(idHash: string) {
    const [row] = await this.db
      .select({ user: users, expiresAt: sessions.expiresAt, createdAt: sessions.createdAt })
      .from(sessions)
      .innerJoin(users, eq(users.id, sessions.userId))
      .where(and(eq(sessions.idHash, idHash), gt(sessions.expiresAt, new Date())))
      .limit(1);
    return row ?? null;
  }

  async extendSession(idHash: string, expiresAt: Date) {
    await this.db.update(sessions).set({ expiresAt }).where(eq(sessions.idHash, idHash));
  }

  async deleteSession(idHash: string) {
    await this.db.delete(sessions).where(eq(sessions.idHash, idHash));
  }

  async deleteSessionsOfUser(userId: string) {
    await this.db.delete(sessions).where(eq(sessions.userId, userId));
  }

  /** Drops expired sessions and recovery tokens. Cheap enough to run opportunistically. */
  async deleteExpired() {
    const now = new Date();
    await this.db.delete(sessions).where(sql`${sessions.expiresAt} <= ${now}`);
    await this.db
      .delete(passwordResetTokens)
      .where(sql`${passwordResetTokens.expiresAt} <= ${now}`);
  }

  /** One pending e-mail change per user: a new request replaces the previous one. */
  async replaceEmailChangeToken(values: {
    tokenHash: string;
    userId: string;
    newEmail: string;
    expiresAt: Date;
  }) {
    await this.db.transaction(async (tx) => {
      await tx.delete(emailChangeTokens).where(eq(emailChangeTokens.userId, values.userId));
      await tx.insert(emailChangeTokens).values(values);
    });
  }

  async findValidEmailChange(tokenHash: string) {
    const [row] = await this.db
      .select({ newEmail: emailChangeTokens.newEmail })
      .from(emailChangeTokens)
      .where(
        and(
          eq(emailChangeTokens.tokenHash, tokenHash),
          isNull(emailChangeTokens.usedAt),
          gt(emailChangeTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /**
   * Spends the token and switches the account to the new address, in one transaction: the e-mail
   * counts as verified (the link reached it), and every session and recovery link of the account
   * ends, since both were tied to the old address. The conditional update makes the token single use.
   * Returns null for an unknown, used or expired token. Throws a unique violation if someone else
   * took the address in the meantime (nothing is changed then, the token stays valid).
   */
  async consumeEmailChange(tokenHash: string) {
    return this.db.transaction(async (tx) => {
      const [token] = await tx
        .update(emailChangeTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(emailChangeTokens.tokenHash, tokenHash),
            isNull(emailChangeTokens.usedAt),
            gt(emailChangeTokens.expiresAt, new Date()),
          ),
        )
        .returning({ userId: emailChangeTokens.userId, newEmail: emailChangeTokens.newEmail });
      if (!token) return null;

      const [before] = await tx
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, token.userId))
        .for("update");
      await tx
        .update(users)
        .set({ email: token.newEmail, emailVerifiedAt: new Date() })
        .where(eq(users.id, token.userId));
      await tx.delete(sessions).where(eq(sessions.userId, token.userId));
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, token.userId));
      await tx.delete(emailChangeTokens).where(eq(emailChangeTokens.userId, token.userId));
      return { oldEmail: before.email, newEmail: token.newEmail };
    });
  }

  /** One live recovery link per user: a new request replaces the previous one. */
  async replaceResetToken(values: { tokenHash: string; userId: string; expiresAt: Date }) {
    await this.db.transaction(async (tx) => {
      await tx.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, values.userId));
      await tx.insert(passwordResetTokens).values(values);
    });
  }

  async findValidResetToken(tokenHash: string) {
    const [row] = await this.db
      .select({ email: users.email })
      .from(passwordResetTokens)
      .innerJoin(users, eq(users.id, passwordResetTokens.userId))
      .where(
        and(
          eq(passwordResetTokens.tokenHash, tokenHash),
          isNull(passwordResetTokens.usedAt),
          gt(passwordResetTokens.expiresAt, new Date()),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  /**
   * Spends the token and sets the new password in one transaction, and ends every session of the
   * account. The conditional update makes the token single use even under concurrent requests.
   * Returns false when the token is unknown, used or expired.
   */
  async consumeResetToken(tokenHash: string, passwordHash: string) {
    return this.db.transaction(async (tx) => {
      const [token] = await tx
        .update(passwordResetTokens)
        .set({ usedAt: new Date() })
        .where(
          and(
            eq(passwordResetTokens.tokenHash, tokenHash),
            isNull(passwordResetTokens.usedAt),
            gt(passwordResetTokens.expiresAt, new Date()),
          ),
        )
        .returning({ userId: passwordResetTokens.userId });
      if (!token) return false;
      await tx.update(users).set({ passwordHash }).where(eq(users.id, token.userId));
      await tx.delete(sessions).where(eq(sessions.userId, token.userId));
      return true;
    });
  }
}
