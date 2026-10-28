import { afterEach, describe, expect, it, vi } from "vitest";

import { backendUrl } from "./backend-url";

afterEach(() => vi.unstubAllEnvs());

describe("backendUrl", () => {
  it("uses BACKEND_URL when it is set", () => {
    vi.stubEnv("BACKEND_URL", "https://api.bordo.app");
    vi.stubEnv("NODE_ENV", "production");
    expect(backendUrl()).toBe("https://api.bordo.app");
  });

  it("defaults to the local API in development", () => {
    vi.stubEnv("BACKEND_URL", "");
    vi.stubEnv("NODE_ENV", "development");
    expect(backendUrl()).toBe("http://localhost:3001");
  });

  it("has no default in production, so a missing setting is not silently wrong", () => {
    vi.stubEnv("BACKEND_URL", "");
    vi.stubEnv("NODE_ENV", "production");
    expect(backendUrl()).toBeUndefined();
  });
});
