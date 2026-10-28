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
import { authUserSchema } from "@bordo/shared/auth";

import { createTestApp } from "./helpers/create-test-app.js";

const databaseUrl = inject("testDatabaseUrl");

const PASSWORD = "Senha-forte-1";

describe.skipIf(!databaseUrl)("auth (real Postgres)", () => {
  let sql: postgres.Sql;
  let app: NestFastifyApplication;

  beforeAll(() => {
    sql = postgres(databaseUrl!, { max: 2 });
  });
  afterAll(async () => {
    await sql.end();
  });

  beforeEach(async () => {
    await sql`truncate table users cascade`;
    app = await createTestApp({ DATABASE_URL: databaseUrl! });
  });
  afterEach(async () => {
    await app.close();
  });

  const post = (url: string, payload?: unknown, cookie?: string) =>
    app.inject({
      method: "POST",
      url: `/api${url}`,
      payload: payload as object | undefined,
      headers: cookie ? { cookie } : {},
    });

  const sessionCookie = (response: { cookies: { name: string; value: string }[] }) => {
    const cookie = response.cookies.find((item) => item.name === "bordo_session");
    return cookie ? `bordo_session=${cookie.value}` : undefined;
  };

  const signUp = async (email = "marina@email.com") => {
    const response = await post("/auth/sign-up", { email, password: PASSWORD });
    expect(response.statusCode).toBe(201);
    return { response, cookie: sessionCookie(response)! };
  };

  describe("sign up", () => {
    it("creates the account, answers with the profile and sets a safe cookie", async () => {
      const { response } = await signUp("Marina@Email.com");

      const user = authUserSchema.parse(response.json());
      expect(user).toMatchObject({
        email: "marina@email.com",
        hasPassword: true,
        emailVerified: false,
      });

      const cookie = response.cookies.find((item) => item.name === "bordo_session")!;
      expect(cookie).toMatchObject({ httpOnly: true, sameSite: "Lax", path: "/" });
      expect(cookie.maxAge).toBe(30 * 24 * 60 * 60);
    });

    it("never stores the password or the raw session id", async () => {
      const { cookie } = await signUp();
      const rawToken = cookie.split("=")[1];

      const [row] = await sql`select password_hash from users`;
      expect(row.password_hash).toMatch(/^\$argon2id\$/);
      expect(row.password_hash).not.toContain(PASSWORD);
      const sessions = await sql`select id_hash from sessions`;
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id_hash).not.toBe(rawToken);
    });

    it("answers 409 for an e-mail already in use, ignoring case", async () => {
      await signUp("marina@email.com");
      const again = await post("/auth/sign-up", { email: "MARINA@email.com", password: PASSWORD });
      expect(again.statusCode).toBe(409);
    });

    it("rejects a short password and a bad e-mail with 400", async () => {
      const short = await post("/auth/sign-up", { email: "a@b.com", password: "curta" });
      expect(short.statusCode).toBe(400);
      expect(short.json().issues[0].path).toBe("password");
      const bad = await post("/auth/sign-up", { email: "nope", password: PASSWORD });
      expect(bad.statusCode).toBe(400);
    });
  });

  describe("sign in and session", () => {
    it("signs in, reads the session and signs out", async () => {
      await signUp();
      const signedIn = await post("/auth/sign-in", {
        email: "marina@email.com",
        password: PASSWORD,
      });
      expect(signedIn.statusCode).toBe(200);
      const cookie = sessionCookie(signedIn)!;

      const session = await app.inject({ url: "/api/auth/session", headers: { cookie } });
      expect(session.statusCode).toBe(200);
      expect(session.json().email).toBe("marina@email.com");

      const out = await post("/auth/sign-out", undefined, cookie);
      expect(out.statusCode).toBe(200);
      expect(out.cookies.find((item) => item.name === "bordo_session")?.value).toBe("");

      const after = await app.inject({ url: "/api/auth/session", headers: { cookie } });
      expect(after.statusCode).toBe(401);
    });

    it("clears the cookie when it points to an unknown or expired session", async () => {
      const { cookie } = await signUp();
      await sql`update sessions set expires_at = now() - interval '1 minute'`;
      const response = await app.inject({ url: "/api/auth/session", headers: { cookie } });
      expect(response.statusCode).toBe(401);
      expect(response.cookies.find((item) => item.name === "bordo_session")?.value).toBe("");
    });

    it("signs out with a JSON content type and no body, like the web client does", async () => {
      const { cookie } = await signUp();
      const out = await app.inject({
        method: "POST",
        url: "/api/auth/sign-out",
        headers: { cookie, "content-type": "application/json" },
      });
      expect(out.statusCode).toBe(200);
      expect((await app.inject({ url: "/api/auth/session", headers: { cookie } })).statusCode).toBe(
        401,
      );
    });

    it("answers 401 without a cookie or with a made up one", async () => {
      expect((await app.inject({ url: "/api/auth/session" })).statusCode).toBe(401);
      const fake = await app.inject({
        url: "/api/auth/session",
        headers: { cookie: "bordo_session=nope" },
      });
      expect(fake.statusCode).toBe(401);
    });

    it("gives the same 401 for a wrong password, an unknown e-mail and a Google-only account", async () => {
      await signUp();
      await sql`insert into users (email, name) values ('google@email.com', 'Gabi')`;

      const attempts = [
        { email: "marina@email.com", password: "Errada-123" },
        { email: "ninguem@email.com", password: PASSWORD },
        { email: "google@email.com", password: PASSWORD },
      ];
      const bodies = [];
      for (const attempt of attempts) {
        const response = await post("/auth/sign-in", attempt);
        expect(response.statusCode).toBe(401);
        bodies.push(response.json().message);
      }
      expect(new Set(bodies).size).toBe(1);
    });

    it("rejects an expired session", async () => {
      const { cookie } = await signUp();
      await sql`update sessions set expires_at = now() - interval '1 minute'`;
      const response = await app.inject({ url: "/api/auth/session", headers: { cookie } });
      expect(response.statusCode).toBe(401);
    });

    it("slides the expiry and renews the cookie once the session is a day old", async () => {
      const { cookie } = await signUp();
      const fresh = await app.inject({ url: "/api/auth/session", headers: { cookie } });
      expect(fresh.cookies).toHaveLength(0);

      await sql`update sessions set expires_at = now() + interval '20 days'`;
      const aged = await app.inject({ url: "/api/auth/session", headers: { cookie } });
      expect(aged.cookies.find((item) => item.name === "bordo_session")).toBeDefined();
      const [{ days }] =
        await sql`select extract(day from expires_at - now()) as days from sessions`;
      expect(Number(days)).toBeGreaterThanOrEqual(29);
    });
  });

  describe("password recovery", () => {
    const requestLink = async (email = "marina@email.com") => {
      const { MailerService } = await import("../src/modules/auth/mailer.service.js");
      const send = vi.spyOn(app.get(MailerService), "sendPasswordReset").mockResolvedValue();
      send.mockClear();
      const response = await post("/auth/forgot-password", { email });
      const link = send.mock.calls[0]?.[1];
      return {
        response,
        send,
        token: link ? new URL(link).searchParams.get("token")! : undefined,
        link,
      };
    };

    it("answers the same for known and unknown e-mails, and only mails the known one", async () => {
      await signUp();
      const known = await requestLink("marina@email.com");
      const unknown = await requestLink("ninguem@email.com");

      expect(known.response.statusCode).toBe(200);
      expect(known.response.json()).toEqual({ email: "marina@email.com" });
      expect(unknown.response.statusCode).toBe(200);
      expect(unknown.response.json()).toEqual({ email: "ninguem@email.com" });
      expect(known.link).toMatch(/^http:\/\/localhost:3000\/recuperar-senha\/nova\?token=/);
      expect(unknown.send).not.toHaveBeenCalled();
    });

    it("resets the password once, ends every session and rejects reuse", async () => {
      const { cookie } = await signUp();
      const { token } = await requestLink();

      const check = await app.inject({ url: `/api/auth/reset-password/${token}` });
      expect(check.json()).toEqual({ email: "marina@email.com" });

      const reset = await post("/auth/reset-password", { token, password: "Nova-senha-9!" });
      expect(reset.statusCode).toBe(200);

      expect((await app.inject({ url: "/api/auth/session", headers: { cookie } })).statusCode).toBe(
        401,
      );
      const oldLogin = await post("/auth/sign-in", {
        email: "marina@email.com",
        password: PASSWORD,
      });
      expect(oldLogin.statusCode).toBe(401);
      const newLogin = await post("/auth/sign-in", {
        email: "marina@email.com",
        password: "Nova-senha-9!",
      });
      expect(newLogin.statusCode).toBe(200);

      expect(
        (await post("/auth/reset-password", { token, password: "Outra-senha-9!" })).statusCode,
      ).toBe(410);
      expect((await app.inject({ url: `/api/auth/reset-password/${token}` })).statusCode).toBe(410);
    });

    it("stores only the hash of the token and keeps one live link per account", async () => {
      await signUp();
      const first = await requestLink();
      const second = await requestLink();

      const rows = await sql`select token_hash from password_reset_tokens`;
      expect(rows).toHaveLength(1);
      expect(rows[0].token_hash).not.toBe(second.token);
      expect(
        (await app.inject({ url: `/api/auth/reset-password/${first.token}` })).statusCode,
      ).toBe(410);
      expect(
        (await app.inject({ url: `/api/auth/reset-password/${second.token}` })).statusCode,
      ).toBe(200);
    });

    it("rejects an expired link and a weak new password", async () => {
      await signUp();
      const { token } = await requestLink();

      const weak = await post("/auth/reset-password", { token, password: "fraca" });
      expect(weak.statusCode).toBe(400);

      await sql`update password_reset_tokens set expires_at = now() - interval '1 minute'`;
      expect((await app.inject({ url: `/api/auth/reset-password/${token}` })).statusCode).toBe(410);
      const late = await post("/auth/reset-password", { token, password: "Nova-senha-9!" });
      expect(late.statusCode).toBe(410);
    });

    it("lets a Google-only account set a password through the same flow", async () => {
      await sql`insert into users (email, name) values ('google@email.com', 'Gabi')`;
      const { token } = await requestLink("google@email.com");
      expect(
        (await post("/auth/reset-password", { token, password: "Nova-senha-9!" })).statusCode,
      ).toBe(200);
      const login = await post("/auth/sign-in", {
        email: "google@email.com",
        password: "Nova-senha-9!",
      });
      expect(login.json().hasPassword).toBe(true);
    });
  });

  describe("rate limits", () => {
    it("blocks the sixth sign-in for the same e-mail with 429", async () => {
      await signUp();
      for (let attempt = 0; attempt < 5; attempt++) {
        const response = await post("/auth/sign-in", {
          email: "marina@email.com",
          password: "Errada-123",
        });
        expect(response.statusCode).toBe(401);
      }
      const blocked = await post("/auth/sign-in", {
        email: "marina@email.com",
        password: PASSWORD,
      });
      expect(blocked.statusCode).toBe(429);
    });

    it("counts the e-mail regardless of letter case", async () => {
      for (let attempt = 0; attempt < 5; attempt++) {
        await post("/auth/sign-in", { email: attempt % 2 ? "A@b.com" : "a@B.com", password: "x" });
      }
      expect((await post("/auth/sign-in", { email: "a@b.com", password: "x" })).statusCode).toBe(
        429,
      );
    });

    it("fails closed when Redis is down", async () => {
      await app.close();
      app = await createTestApp({ DATABASE_URL: databaseUrl!, REDIS_URL: "redis://127.0.0.1:1" });
      const response = await post("/auth/sign-in", {
        email: "marina@email.com",
        password: PASSWORD,
      });
      expect(response.statusCode).toBe(503);
    });
  });
});

describe("auth guard", () => {
  it("keeps the health check public and protects /auth/session", async () => {
    const app = await createTestApp();
    try {
      expect((await app.inject({ url: "/api/health" })).statusCode).toBe(200);
      expect((await app.inject({ url: "/api/auth/session" })).statusCode).toBe(401);
    } finally {
      await app.close();
    }
  });
});
