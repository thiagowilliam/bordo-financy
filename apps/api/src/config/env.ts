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
