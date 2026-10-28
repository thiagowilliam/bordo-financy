import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { ThrottlerStorage } from "@nestjs/throttler";
import { afterEach, describe, expect, it } from "vitest";

import { createTestApp } from "./helpers/create-test-app.js";

let app: NestFastifyApplication;

afterEach(async () => {
  await app?.close();
});

describe("health", () => {
  it("answers liveness and readiness without Redis configured", async () => {
    app = await createTestApp();

    const live = await app.inject({ url: "/api/health" });
    expect(live.statusCode).toBe(200);
    expect(live.json()).toMatchObject({ status: "ok" });

    const ready = await app.inject({ url: "/api/health/ready" });
    expect(ready.statusCode).toBe(200);
    expect(ready.json().info.redis).toMatchObject({ status: "up", configured: false });
    expect(ready.json().info.database).toMatchObject({ status: "up", configured: false });
  });

  it("reports not ready when Postgres is unreachable", async () => {
    app = await createTestApp({ DATABASE_URL: "postgres://bordo:bordo@127.0.0.1:1/bordo" });

    const ready = await app.inject({ url: "/api/health/ready" });
    expect(ready.statusCode).toBe(503);
    expect(ready.json().error.database.status).toBe("down");
  });

  it("reports not ready when Redis is unreachable", async () => {
    app = await createTestApp({ REDIS_URL: "redis://127.0.0.1:1" });

    const ready = await app.inject({ url: "/api/health/ready" });
    expect(ready.statusCode).toBe(503);
    expect(ready.json().status).toBe("error");
  }, 20_000);
});

describe("security headers", () => {
  it("sends the Helmet defaults", async () => {
    app = await createTestApp();
    const { headers } = await app.inject({ url: "/api/health" });

    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-frame-options"]).toBeDefined();
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

describe("errors", () => {
  it("uses one shape and keeps the caller's request id", async () => {
    app = await createTestApp();
    const response = await app.inject({ url: "/api/nope", headers: { "x-request-id": "abc-123" } });

    expect(response.statusCode).toBe(404);
    expect(response.headers["x-request-id"]).toBe("abc-123");
    expect(response.json()).toMatchObject({
      statusCode: 404,
      error: "Not Found",
      requestId: "abc-123",
    });
  });

  it("generates a request id when the header is missing or unsafe", async () => {
    app = await createTestApp();
    const response = await app.inject({
      url: "/api/nope",
      headers: { "x-request-id": "bad id\twith spaces" },
    });

    expect(response.json().requestId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("does not leak the message of unexpected errors", async () => {
    app = await createTestApp();
    const response = await app.inject({ url: "/api/test/boom" });

    expect(response.statusCode).toBe(500);
    expect(response.json()).toMatchObject({ message: "Internal server error" });
    expect(response.payload).not.toContain("secret internal detail");
  });
});

describe("validation", () => {
  it("accepts a valid body", async () => {
    app = await createTestApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/test/echo",
      payload: { name: "Lis", age: 3 },
    });

    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({ name: "Lis", age: 3 });
  });

  it("rejects an invalid body with the failing paths", async () => {
    app = await createTestApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/test/echo",
      payload: { name: "L", age: 1.5 },
    });

    expect(response.statusCode).toBe(400);
    const body = response.json();
    expect(body).toMatchObject({ statusCode: 400, message: "Validation failed" });
    expect(body.issues.map((issue: { path: string }) => issue.path).sort()).toEqual([
      "age",
      "name",
    ]);
  });
});

describe("shared schemas", () => {
  it("validates with a schema from @bordo/shared", async () => {
    app = await createTestApp();

    const ok = await app.inject({
      method: "POST",
      url: "/api/test/sign-in",
      payload: { email: "ana@example.com", password: "Str0ng!pass" },
    });
    expect(ok.statusCode).toBe(201);

    const bad = await app.inject({
      method: "POST",
      url: "/api/test/sign-in",
      payload: { email: "not-an-email", password: "" },
    });
    expect(bad.statusCode).toBe(400);
    expect(bad.json().issues.map((issue: { path: string }) => issue.path)).toContain("email");
  });
});

describe("content type", () => {
  it("rejects a body that is not JSON", async () => {
    app = await createTestApp();
    const response = await app.inject({
      method: "POST",
      url: "/api/test/echo",
      payload: "name=Lis",
      headers: { "content-type": "text/plain" },
    });

    expect(response.statusCode).toBe(415);
  });

  it("allows mutations without a body", async () => {
    app = await createTestApp();
    const response = await app.inject({ method: "POST", url: "/api/test/empty" });

    expect(response.statusCode).toBe(201);
  });
});

describe("rate limit", () => {
  it("answers 429 in the standard shape once the limit is reached, but never for health", async () => {
    app = await createTestApp({ THROTTLE_LIMIT: "3" });

    for (let attempt = 0; attempt < 3; attempt++) {
      expect((await app.inject({ url: "/api/test/ping" })).statusCode).toBe(200);
    }
    const blocked = await app.inject({ url: "/api/test/ping" });
    expect(blocked.statusCode).toBe(429);
    expect(blocked.json()).toMatchObject({ statusCode: 429, error: "Too Many Requests" });
    expect(blocked.headers["retry-after"]).toBeDefined();

    expect((await app.inject({ url: "/api/health" })).statusCode).toBe(200);
  });

  it("counts clients by forwarded address when the proxy is trusted", async () => {
    app = await createTestApp({ THROTTLE_LIMIT: "2", TRUST_PROXY: "127.0.0.1" });
    const as = (ip: string) =>
      app.inject({ url: "/api/test/ping", headers: { "x-forwarded-for": ip } });

    await as("203.0.113.1");
    await as("203.0.113.1");
    expect((await as("203.0.113.1")).statusCode).toBe(429);
    expect((await as("203.0.113.2")).statusCode).toBe(200);
  });

  it("ignores forwarded addresses when no proxy is trusted", async () => {
    app = await createTestApp({ THROTTLE_LIMIT: "2" });
    const as = (ip: string) =>
      app.inject({ url: "/api/test/ping", headers: { "x-forwarded-for": ip } });

    await as("203.0.113.1");
    await as("203.0.113.2");
    expect((await as("203.0.113.3")).statusCode).toBe(429);
  });

  it("keeps serving requests when the limiter storage fails", async () => {
    app = await createTestApp({}, (builder) =>
      builder.overrideProvider(ThrottlerStorage).useValue({
        increment: async () => {
          throw new Error("redis down");
        },
      }),
    );

    expect((await app.inject({ url: "/api/test/ping" })).statusCode).toBe(200);
  });
});
