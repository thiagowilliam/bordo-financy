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

  it("requires REDIS_URL in production", () => {
    expect(() => validateEnv({ NODE_ENV: "production" })).toThrow(/REDIS_URL/);
    expect(validateEnv({ NODE_ENV: "production", REDIS_URL: "redis://redis:6379" }).REDIS_URL).toBe(
      "redis://redis:6379",
    );
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
