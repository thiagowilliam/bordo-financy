import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import postgres from "postgres";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  inject,
  it,
  vi,
} from "vitest";

import { createTestApp } from "./helpers/create-test-app.js";

const databaseUrl = inject("testDatabaseUrl");
const PASSWORD = "Senha-forte-1";
const CLIENT_ID = "client-id.apps.googleusercontent.com";
const REDIRECT = "http://localhost:3000/api/auth/google/callback";
const env = {
  GOOGLE_CLIENT_ID: CLIENT_ID,
  GOOGLE_CLIENT_SECRET: "secret",
  GOOGLE_REDIRECT_URI: REDIRECT,
};

const idToken = (claims: Record<string, unknown>) =>
  [
    "header",
    Buffer.from(
      JSON.stringify({
        iss: "https://accounts.google.com",
        aud: CLIENT_ID,
        exp: Math.floor(Date.now() / 1000) + 3600,
        sub: "google-sub-1",
        email: "marina@gmail.com",
        email_verified: true,
        name: "Marina Souza",
        picture: "https://lh3.googleusercontent.com/a/photo",
        ...claims,
      }),
    ).toString("base64url"),
    "signature",
  ].join(".");

describe.skipIf(!databaseUrl)("Google sign-in (real Postgres)", () => {
  let sql: postgres.Sql;
  let app: NestFastifyApplication;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    sql = postgres(databaseUrl!, { max: 2 });
  });
  afterAll(async () => {
    await sql.end();
  });
  beforeEach(async () => {
    await sql`truncate table users cascade`;
    app = await createTestApp({ DATABASE_URL: databaseUrl!, ...env });
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(async () => {
    vi.unstubAllGlobals();
    await app.close();
  });

  /** Google's token endpoint answering with this ID token. */
  const googleReturns = (claims: Record<string, unknown> = {}) =>
    fetchMock.mockImplementation(async () => Response.json({ id_token: idToken(claims) }));

  /** Starts the flow and returns what the browser would hold when Google sends the person back. */
  async function start(query = "", cookie?: string) {
    const response = await app.inject({
      method: "GET",
      url: `/api/auth/google${query}`,
      headers: cookie ? { cookie } : {},
    });
    const flow = response.cookies.find((item) => item.name === "bordo_oauth");
    const location = response.headers.location as string;
    return { response, flow, location, state: new URL(location).searchParams.get("state") };
  }

  async function callback(
    flow: { value: string } | undefined,
    params: Record<string, string>,
    cookie = "",
  ) {
    const query = new URLSearchParams(params).toString();
    return app.inject({
      method: "GET",
      url: `/api/auth/google/callback?${query}`,
      headers: {
        cookie: [flow ? `bordo_oauth=${flow.value}` : "", cookie].filter(Boolean).join("; "),
      },
    });
  }

  const signUp = async (email = "marina@gmail.com") => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up",
      payload: { email, password: PASSWORD },
    });
    const session = response.cookies.find((item) => item.name === "bordo_session")!;
    return `bordo_session=${session.value}`;
  };

  it("redirects to Google with state and a PKCE challenge, and keeps the verifier in a cookie", async () => {
    const { response, flow, location } = await start("?next=/viagens/nova");

    expect(response.statusCode).toBe(302);
    const url = new URL(location);
    expect(url.origin + url.pathname).toBe("https://accounts.google.com/o/oauth2/v2/auth");
    expect(url.searchParams.get("client_id")).toBe(CLIENT_ID);
    expect(url.searchParams.get("redirect_uri")).toBe(REDIRECT);
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("code_challenge")).toBeTruthy();
    expect(flow?.httpOnly).toBe(true);
    expect(location).not.toContain(PASSWORD);
    expect(flow!.value).not.toContain("client_secret");
  });

  it("creates the account on the first access and lands on onboarding", async () => {
    const { flow, state } = await start();
    googleReturns();

    const response = await callback(flow, { code: "abc", state: state! });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe("http://localhost:3000/onboarding");
    const session = response.cookies.find((item) => item.name === "bordo_session")!;
    expect(session.httpOnly).toBe(true);

    // The code is swapped with the verifier (PKCE) and the client secret.
    const body = fetchMock.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("code")).toBe("abc");
    expect(body.get("code_verifier")).toBeTruthy();
    expect(body.get("client_secret")).toBe("secret");

    const me = await app.inject({
      method: "GET",
      url: "/api/auth/session",
      headers: { cookie: `bordo_session=${session.value}` },
    });
    expect(me.json()).toMatchObject({
      email: "marina@gmail.com",
      name: "Marina Souza",
      emailVerified: true,
      hasPassword: false,
      googleEmail: "marina@gmail.com",
      photoUrl: "https://lh3.googleusercontent.com/a/photo",
    });
    const [{ count }] = await sql`select count(*)::int as count from categories`;
    expect(count).toBeGreaterThan(0);
  });

  it("signs a returning Google user in and goes to next", async () => {
    googleReturns();
    const first = await start();
    await callback(first.flow, { code: "abc", state: first.state! });

    const second = await start("?next=/viagens/nova");
    const response = await callback(second.flow, { code: "def", state: second.state! });

    expect(response.headers.location).toBe("http://localhost:3000/viagens/nova");
    expect(response.cookies.some((item) => item.name === "bordo_session")).toBe(true);
    const [{ count }] = await sql`select count(*)::int as count from users`;
    expect(count).toBe(1);
  });

  it("does not link silently to a password account with the same e-mail", async () => {
    await signUp();
    googleReturns();
    const { flow, state } = await start();

    const response = await callback(flow, { code: "abc", state: state! });

    expect(response.headers.location).toBe("http://localhost:3000/entrar?error=account-exists");
    expect(response.cookies.some((item) => item.name === "bordo_session")).toBe(false);
    const [{ count }] = await sql`select count(*)::int as count from oauth_accounts`;
    expect(count).toBe(0);
  });

  it("connects Google to the signed-in account from the profile", async () => {
    const cookie = await signUp("marina@email.com");
    googleReturns();
    const { flow, state } = await start("?link=1&next=/perfil", cookie);

    const response = await callback(flow, { code: "abc", state: state! }, cookie);

    expect(response.headers.location).toBe("http://localhost:3000/perfil");
    const me = await app.inject({ method: "GET", url: "/api/auth/session", headers: { cookie } });
    expect(me.json()).toMatchObject({
      email: "marina@email.com",
      hasPassword: true,
      googleEmail: "marina@gmail.com",
    });
  });

  it("refuses to connect Google when nobody is signed in", async () => {
    const { response } = await start("?link=1&next=/perfil");

    expect(response.headers.location).toBe("http://localhost:3000/entrar?error=google");
    expect(response.cookies.some((item) => item.name === "bordo_oauth")).toBe(false);
  });

  it("refuses a Google account that belongs to another user", async () => {
    googleReturns();
    const first = await start();
    await callback(first.flow, { code: "abc", state: first.state! });

    const cookie = await signUp("outra@email.com");
    const { flow, state } = await start("?link=1&next=/perfil", cookie);
    const response = await callback(flow, { code: "def", state: state! }, cookie);

    expect(response.headers.location).toBe("http://localhost:3000/perfil?google=error");
    const [{ count }] = await sql`select count(*)::int as count from oauth_accounts`;
    expect(count).toBe(1);
  });

  it.each([
    ["a state that does not match", { state: "forged" }],
    ["a refusal at Google", { error: "access_denied", state: "", code: "" }],
  ])("sends %s back to sign in without a session", async (_name, params) => {
    const { flow } = await start();

    const response = await callback(flow, { code: "abc", ...params });

    expect(response.headers.location).toBe("http://localhost:3000/entrar?error=google");
    expect(response.cookies.some((item) => item.name === "bordo_session")).toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails without the flow cookie (a callback not started here)", async () => {
    const response = await callback(undefined, { code: "abc", state: "x" });

    expect(response.headers.location).toBe("http://localhost:3000/entrar?error=google");
  });

  it.each([
    ["an unverified e-mail", { email_verified: false }],
    ["another audience", { aud: "someone-else" }],
    ["an expired token", { exp: 1 }],
    ["another issuer", { iss: "https://evil.example" }],
  ])("rejects an ID token with %s", async (_name, claims) => {
    const { flow, state } = await start();
    googleReturns(claims);

    const response = await callback(flow, { code: "abc", state: state! });

    expect(response.headers.location).toBe("http://localhost:3000/entrar?error=google");
    const [{ count }] = await sql`select count(*)::int as count from users`;
    expect(count).toBe(0);
  });

  it("fails when Google answers an error to the code exchange", async () => {
    const { flow, state } = await start();
    fetchMock.mockResolvedValue(new Response("{}", { status: 400 }));

    const response = await callback(flow, { code: "abc", state: state! });

    expect(response.headers.location).toBe("http://localhost:3000/entrar?error=google");
  });

  it("uses the flow once", async () => {
    googleReturns();
    const { flow, state } = await start();
    const first = await callback(flow, { code: "abc", state: state! });

    expect(first.cookies.find((item) => item.name === "bordo_oauth")?.value).toBe("");
  });

  it("does not follow an external next", async () => {
    googleReturns();
    const first = await start("?next=//evil.example");
    await callback(first.flow, { code: "abc", state: first.state! });
    const second = await start("?next=//evil.example");

    const response = await callback(second.flow, { code: "def", state: second.state! });

    expect(response.headers.location).toBe("http://localhost:3000/viagens");
  });
});

describe("Google sign-in without credentials", () => {
  it("sends the visitor back to sign in with an error", async () => {
    const app = await createTestApp();
    try {
      const response = await app.inject({ method: "GET", url: "/api/auth/google" });
      expect(response.statusCode).toBe(302);
      expect(response.headers.location).toBe("http://localhost:3000/entrar?error=google");
    } finally {
      await app.close();
    }
  });
});
