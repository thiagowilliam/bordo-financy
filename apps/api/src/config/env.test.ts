import { describe, expect, it } from "vitest";

import { parseTrustProxy, validateEnv } from "./env.js";

describe("validateEnv", () => {
  it("applies defaults", () => {
    const env = validateEnv({});
    expect(env).toMatchObject({ NODE_ENV: "development", PORT: 3001, THROTTLE_LIMIT: 120 });
    expect(env.REDIS_URL).toBeUndefined();
  });

  it("coerces numbers and treats empty strings as unset", () => {
    const env = validateEnv({ PORT: "4000", REDIS_URL: "", TRUST_PROXY: "" });
    expect(env.PORT).toBe(4000);
    expect(env.REDIS_URL).toBeUndefined();
  });

  /** Everything production needs, so each test can take one thing away. */
  const production = {
    NODE_ENV: "production",
    DATABASE_URL: "postgres://u:p@db:5432/bordo",
    REDIS_URL: "redis://redis:6379",
    MAIL_SMTP_URL: "smtps://user:pass@smtp.example.com:465",
    MAIL_FROM: "Bordo <nao-responda@bordo.test>",
  };

  const without = (key: keyof typeof production) =>
    Object.fromEntries(Object.entries(production).filter(([name]) => name !== key));

  it("accepts a complete production environment", () => {
    expect(validateEnv(production)).toMatchObject({ NODE_ENV: "production", MAIL_WORKER: true });
  });

  it("requires REDIS_URL in production", () => {
    expect(() => validateEnv(without("REDIS_URL"))).toThrow(/REDIS_URL/);
    expect(validateEnv(production).REDIS_URL).toBe("redis://redis:6379");
  });

  it("requires DATABASE_URL in production", () => {
    expect(() => validateEnv(without("DATABASE_URL"))).toThrow(/DATABASE_URL/);
    expect(validateEnv(production).DATABASE_URL).toBe("postgres://u:p@db:5432/bordo");
    expect(validateEnv({ DATABASE_URL: "" }).DATABASE_URL).toBeUndefined();
  });

  it("requires the SMTP server and the sender in production, so e-mails are never only logged there", () => {
    expect(() => validateEnv(without("MAIL_SMTP_URL"))).toThrow(/MAIL_SMTP_URL/);
    expect(() => validateEnv(without("MAIL_FROM"))).toThrow(/MAIL_FROM/);
    expect(() => validateEnv({ ...production, MAIL_SMTP_URL: "" })).toThrow(/MAIL_SMTP_URL/);
  });

  it("mail settings are optional in development and validated when present", () => {
    expect(validateEnv({}).MAIL_SMTP_URL).toBeUndefined();
    expect(validateEnv({ MAIL_SMTP_URL: "smtp://localhost:1025" }).MAIL_SMTP_URL).toBe(
      "smtp://localhost:1025",
    );
    expect(() => validateEnv({ MAIL_SMTP_URL: "https://not-smtp.example.com" })).toThrow(
      /MAIL_SMTP_URL/,
    );
    expect(validateEnv({ MAIL_WORKER: "false" }).MAIL_WORKER).toBe(false);
    expect(validateEnv({}).QUEUE_PREFIX).toBe("bordo");
  });

  it("rejects invalid values with every problem listed", () => {
    expect(() => validateEnv({ PORT: "abc", LOG_LEVEL: "loud" })).toThrow(/PORT[\s\S]*LOG_LEVEL/);
  });

  it("rejects a numeric TRUST_PROXY", () => {
    expect(() => validateEnv({ TRUST_PROXY: "1" })).toThrow(/TRUST_PROXY/);
  });
});

describe("parseTrustProxy", () => {
  it("maps the supported shapes", () => {
    expect(parseTrustProxy(undefined)).toBe(false);
    expect(parseTrustProxy("false")).toBe(false);
    expect(parseTrustProxy("true")).toBe(true);
    expect(parseTrustProxy("loopback, 10.0.0.0/8")).toEqual(["loopback", "10.0.0.0/8"]);
  });
});
