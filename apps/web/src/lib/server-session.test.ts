import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getSessionUser } from "./server-session";

const jar: Record<string, string> = {};
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (jar[name] ? { value: jar[name] } : undefined) }),
}));

const user = {
  id: "u1",
  name: "Marina Duarte",
  email: "marina@email.com",
  emailVerified: true,
  photoUrl: null,
  currency: "BRL",
  hasPassword: true,
  googleEmail: null,
  createdAt: "2026-03-14",
};

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubEnv("BACKEND_URL", "http://api.test");
  vi.stubGlobal("fetch", fetchMock);
  for (const key of Object.keys(jar)) delete jar[key];
  fetchMock.mockReset();
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("getSessionUser", () => {
  it("reads the user with only the session cookie and never caches", async () => {
    jar.bordo_session = "abc";
    jar.other = "secret";
    fetchMock.mockResolvedValue(Response.json(user));

    expect(await getSessionUser()).toEqual(user);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("http://api.test/api/auth/session");
    expect(init.headers).toEqual({ cookie: "bordo_session=abc" });
    expect(init.cache).toBe("no-store");
  });

  it("does not call the API without a session cookie", async () => {
    expect(await getSessionUser()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("is null for a stale session, an API that fails and an answer of the wrong shape", async () => {
    jar.bordo_session = "stale";
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 401 }));
    expect(await getSessionUser()).toBeNull();

    fetchMock.mockRejectedValueOnce(new Error("ECONNREFUSED"));
    expect(await getSessionUser()).toBeNull();

    fetchMock.mockResolvedValueOnce(Response.json({ nope: true }));
    expect(await getSessionUser()).toBeNull();
  });
});
