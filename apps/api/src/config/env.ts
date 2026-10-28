import { z } from "zod";

const emptyToUndefined = (value: unknown) => (value === "" ? undefined : value);

/**
 * Fastify `trustProxy` for the hops in front of the API. A hop count (`1`) trusts no proxy at all
 * on Fastify 5.12+, so numbers are rejected instead of silently breaking client IP detection.
 */
export function parseTrustProxy(value: string | undefined): boolean | string[] {
  const raw = value?.trim() ?? "";
  if (raw === "" || raw === "false") return false;
  if (raw === "true") return true;
  if (/^\d+$/.test(raw)) {
    throw new Error("TRUST_PROXY must be true, false or a list of proxy addresses, not a number");
  }
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().min(1).max(65535).default(3001),
    HOST: z.string().min(1).default("0.0.0.0"),
    LOG_LEVEL: z
      .enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"])
      .default("info"),
    REDIS_URL: z.preprocess(emptyToUndefined, z.url().optional()),
    DATABASE_URL: z.preprocess(emptyToUndefined, z.url().optional()),
    DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
    /** Where photos are stored. Only `local` (a folder on disk) exists; an S3 compatible driver is next. */
    STORAGE_DRIVER: z.enum(["local"]).default("local"),
    STORAGE_LOCAL_DIR: z.string().min(1).default("storage"),
    /** Prefix of the photo URLs the API returns: the media route, or the CDN / bucket address later. */
    MEDIA_BASE_URL: z.string().min(1).default("/api/media"),
    /** SMTP server for account e-mails, as a URL: `smtps://user:password@host:465`. Any provider with SMTP works (Resend, Amazon SES...). Without it, e-mails are only logged (development). */
    MAIL_SMTP_URL: z.preprocess(
      emptyToUndefined,
      z
        .string()
        .regex(/^smtps?:\/\//i, "MAIL_SMTP_URL must start with smtp:// or smtps://")
        .optional(),
    ),
    /** Sender, like `Bordo <nao-responda@seudominio.com>`. The domain must be verified at the provider. */
    MAIL_FROM: z.preprocess(emptyToUndefined, z.string().min(3).optional()),
    /** Runs the e-mail worker inside this process. Turn off to run it elsewhere. */
    MAIL_WORKER: z.stringbool().default(true),
    /** First retry delay of a failed e-mail, doubled on each attempt (5 attempts). */
    MAIL_RETRY_DELAY_MS: z.coerce.number().int().positive().default(10_000),
    /** Prefix of the queue keys in Redis, so environments can share one Redis. */
    QUEUE_PREFIX: z.string().min(1).default("bordo"),
    /** Public address of the web app, used in e-mailed links. */
    WEB_URL: z.url().default("http://localhost:3000"),
    TRUST_PROXY: z.preprocess(emptyToUndefined, z.string().optional()),
    THROTTLE_TTL_MS: z.coerce.number().int().positive().default(60_000),
    THROTTLE_LIMIT: z.coerce.number().int().positive().default(120),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === "production" && !env.REDIS_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["REDIS_URL"],
        message: "REDIS_URL is required in production so rate limits are shared by every instance",
      });
    }
    if (env.NODE_ENV === "production" && !env.DATABASE_URL) {
      ctx.addIssue({
        code: "custom",
        path: ["DATABASE_URL"],
        message: "DATABASE_URL is required in production",
      });
    }
    if (env.NODE_ENV === "production") {
      for (const key of ["MAIL_SMTP_URL", "MAIL_FROM"] as const) {
        if (!env[key]) {
          ctx.addIssue({
            code: "custom",
            path: [key],
            message: `${key} is required in production`,
          });
        }
      }
    }
    try {
      parseTrustProxy(env.TRUST_PROXY);
    } catch (error) {
      ctx.addIssue({ code: "custom", path: ["TRUST_PROXY"], message: (error as Error).message });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment:\n${details}`);
  }
  return result.data;
}
