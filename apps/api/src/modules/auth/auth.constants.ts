export const SESSION_COOKIE = "bordo_session";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export const SESSION_TTL_MS = 30 * DAY;
/** The expiry only moves forward when the last refresh is older than this, to avoid a write per request. */
export const SESSION_REFRESH_AFTER_MS = DAY;

export const RESET_TOKEN_TTL_MS = HOUR;
export const EMAIL_CHANGE_TOKEN_TTL_MS = HOUR;

/** Per window limits. `ip` and `email` are counted separately, both must pass. */
export const AUTH_LIMITS = {
  signIn: { ip: { limit: 20, windowMs: 15 * MINUTE }, email: { limit: 5, windowMs: 15 * MINUTE } },
  signUp: { ip: { limit: 10, windowMs: HOUR }, email: { limit: 3, windowMs: HOUR } },
  forgotPassword: { ip: { limit: 10, windowMs: HOUR }, email: { limit: 3, windowMs: HOUR } },
  resetPassword: { ip: { limit: 10, windowMs: HOUR } },
  emailChange: { user: { limit: 3, windowMs: HOUR } },
  google: { ip: { limit: 30, windowMs: 15 * MINUTE } },
  confirmEmailChange: { ip: { limit: 10, windowMs: HOUR } },
} as const;
