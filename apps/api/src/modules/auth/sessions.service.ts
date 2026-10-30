import { Injectable } from "@nestjs/common";

import { SESSION_REFRESH_AFTER_MS, SESSION_TTL_MS } from "./auth.constants.js";
import { AuthRepository, toSessionUser } from "./auth.repository.js";
import type { SessionUser } from "./session-user.js";
import { generateToken, hashToken } from "./tokens.js";

export interface ValidSession {
  user: SessionUser;
  /** The cookie has to be sent again with a new expiry. */
  refreshed: boolean;
}

@Injectable()
export class SessionsService {
  constructor(private readonly repository: AuthRepository) {}

  /** Starts a session and returns the raw token for the cookie. Only its hash is stored. */
  async create(userId: string, userAgent: string | null) {
    const token = generateToken();
    await this.repository.createSession({
      idHash: hashToken(token),
      userId,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      userAgent: userAgent?.slice(0, 256) ?? null,
    });
    return token;
  }

  /** The user for a cookie value, or null when the session is unknown or expired. Slides the expiry. */
  async validate(token: string): Promise<ValidSession | null> {
    const idHash = hashToken(token);
    const row = await this.repository.findActiveSession(idHash);
    if (!row) return null;

    // Sliding window: expiry is always "30 days after the last refresh".
    const remaining = row.expiresAt.getTime() - Date.now();
    const refreshed = SESSION_TTL_MS - remaining > SESSION_REFRESH_AFTER_MS;
    if (refreshed) {
      await this.repository.extendSession(idHash, new Date(Date.now() + SESSION_TTL_MS));
    }
    return { user: toSessionUser(row.user, row.googleEmail), refreshed };
  }

  async destroy(token: string) {
    await this.repository.deleteSession(hashToken(token));
  }
}
