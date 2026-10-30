import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createTestApp } from "./helpers/create-test-app.js";

interface Operation {
  summary?: string;
  tags?: string[];
  security?: Record<string, string[]>[];
  responses: Record<string, { content?: Record<string, { schema?: Record<string, unknown> }> }>;
}
interface Document {
  paths: Record<string, Record<string, Operation>>;
  components: { schemas: Record<string, unknown>; securitySchemes: Record<string, unknown> };
}

/** Routes that exist only for the test app. */
const isTestRoute = (path: string) => path.startsWith("/api/test/");

/** Public on purpose: no session needed. */
const PUBLIC_PREFIXES = ["/api/auth/", "/api/health", "/api/media/"];
const NEEDS_SESSION_EXCEPTIONS = ["/api/auth/session"];

describe("OpenAPI document", () => {
  let app: NestFastifyApplication;
  let doc: Document;

  beforeAll(async () => {
    app = await createTestApp({ SWAGGER_ENABLED: "true" });
    doc = (await app.inject({ method: "GET", url: "/api/docs-json" })).json();
  });
  afterAll(async () => {
    await app.close();
  });

  const operations = () =>
    Object.entries(doc.paths)
      .filter(([path]) => !isTestRoute(path))
      .flatMap(([path, methods]) =>
        Object.entries(methods).map(([method, operation]) => ({
          label: `${method.toUpperCase()} ${path}`,
          path,
          operation,
        })),
      );

  it("serves the UI and the JSON under the global prefix", async () => {
    const ui = await app.inject({ method: "GET", url: "/api/docs" });
    expect(ui.statusCode).toBe(200);
    expect(ui.headers["content-type"]).toContain("text/html");
  });

  it("documents the cookie session", () => {
    expect(doc.components.securitySchemes).toMatchObject({
      cookie: { type: "apiKey", in: "cookie", name: "bordo_session" },
    });
  });

  it("gives every route a tag and a summary", () => {
    for (const { label, operation } of operations()) {
      expect(operation.tags?.length, `${label} has no tag`).toBeGreaterThan(0);
      expect(operation.summary, `${label} has no summary`).toBeTruthy();
    }
  });

  it("asks for the cookie on every route that needs a session, and only there", () => {
    for (const { label, path, operation } of operations()) {
      const isPublic =
        PUBLIC_PREFIXES.some((prefix) => path.startsWith(prefix)) &&
        !NEEDS_SESSION_EXCEPTIONS.includes(path);
      const hasCookie = operation.security?.some((entry) => "cookie" in entry) ?? false;
      expect(hasCookie, label).toBe(!isPublic);
    }
  });

  it("describes request bodies and responses with the shared schemas", () => {
    const names = Object.keys(doc.components.schemas);
    expect(names).toEqual(
      expect.arrayContaining(["CreateTripDto", "TripSummaryDto", "TripDetailDto", "UserDto"]),
    );

    const list = doc.paths["/api/trips"].get.responses["200"].content!["application/json"].schema!;
    expect(list).toMatchObject({
      type: "array",
      items: { $ref: "#/components/schemas/TripSummaryDto" },
    });
  });

  it("documents the Google flow as redirects", () => {
    const start = doc.paths["/api/auth/google"].get;
    expect(start.responses).toHaveProperty("302");
    expect(doc.paths["/api/auth/google/callback"].get.responses).toHaveProperty("302");
  });
});

describe("OpenAPI document switch", () => {
  it("is not served unless turned on", async () => {
    const app = await createTestApp();
    try {
      const response = await app.inject({ method: "GET", url: "/api/docs-json" });
      expect(response.statusCode).toBe(404);
    } finally {
      await app.close();
    }
  });
});
