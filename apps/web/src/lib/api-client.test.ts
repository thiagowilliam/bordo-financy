import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";
import { z } from "zod";

import { server } from "@/mocks/server";

import { apiFetch } from "./api-client";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const seen: { contentType: string | null }[] = [];
const echoHeaders = http.post("/api/echo", ({ request }) => {
  seen.push({ contentType: request.headers.get("content-type") });
  return HttpResponse.json({});
});

describe("apiFetch", () => {
  it("declares JSON only when it sends a body", async () => {
    seen.length = 0;
    server.use(echoHeaders);
    await apiFetch("/api/echo", z.object({}), { method: "POST", body: { a: 1 } });
    await apiFetch("/api/echo", z.object({}), { method: "POST" });
    expect(seen[0].contentType).toContain("application/json");
    expect(seen[1].contentType).toBeNull();
  });
});
