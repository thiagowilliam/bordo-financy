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
import { emailChangedSchema, emailChangeTokenSchema } from "@bordo/shared/auth";

import { createTestApp } from "./helpers/create-test-app.js";

const databaseUrl = inject("testDatabaseUrl");
const PASSWORD = "Senha-forte-1";

describe.skipIf(!databaseUrl)("change of e-mail (real Postgres)", () => {
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

  /** Spies on the mailer after the app is built (same module instance as the app's). */
  async function mailer() {
    const { MailerService } = await import("../src/modules/mail/mailer.service.js");
    const service = app.get(MailerService);
    return {
      change: vi.spyOn(service, "sendEmailChange").mockResolvedValue(),
      changed: vi.spyOn(service, "sendEmailChanged").mockResolvedValue(),
    };
  }

  const signUp = async (email = "marina@email.com") => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up",
      payload: { email, password: PASSWORD },
    });
    const cookie = response.cookies.find((item) => item.name === "bordo_session")!;
    return { id: response.json().id as string, cookie: `bordo_session=${cookie.value}` };
  };

  const call = (method: "GET" | "POST", url: string, cookie?: string, payload?: object) =>
    app.inject({ method, url: `/api${url}`, headers: cookie ? { cookie } : {}, payload });

  const request = (cookie: string | undefined, email: string) =>
    call("POST", "/profile/email-change", cookie, { email });

  /** Asks for the change and returns the token that went to the new address. */
  async function requestToken(cookie: string, email = "novo@email.com") {
    const spies = await mailer();
    expect((await request(cookie, email)).statusCode).toBe(200);
    const link = spies.change.mock.calls.at(-1)?.[1];
    return { token: link ? new URL(link).searchParams.get("token")! : undefined, link, ...spies };
  }

  const confirm = (token: string, cookie?: string) =>
    call("POST", "/auth/email-change/confirm", cookie, { token });

  describe("POST /profile/email-change", () => {
    it("requires a session", async () => {
      expect((await request(undefined, "novo@email.com")).statusCode).toBe(401);
    });

    it("sends the confirmation link to the NEW address and changes nothing yet", async () => {
      const { cookie } = await signUp();
      const spies = await mailer();
      const response = await request(cookie, "  Novo@Email.com ");

      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ email: "Novo@Email.com" });
      expect(spies.change).toHaveBeenCalledTimes(1);
      const [to, link] = spies.change.mock.calls[0];
      expect(to).toBe("novo@email.com");
      expect(link).toMatch(/^http:\/\/localhost:3000\/confirmar-email\?token=[\w-]{43}$/);

      const profile = (await call("GET", "/profile", cookie)).json();
      expect(profile.email).toBe("marina@email.com");
    });

    it("stores only a hash of the token", async () => {
      const { cookie } = await signUp();
      const { token } = await requestToken(cookie);
      const rows = await sql`select token_hash, new_email from email_change_tokens`;
      expect(rows).toHaveLength(1);
      expect(rows[0].token_hash).not.toBe(token);
      expect(rows[0].new_email).toBe("novo@email.com");
    });

    it("validates the address", async () => {
      const { cookie } = await signUp();
      expect((await request(cookie, "not-an-email")).statusCode).toBe(400);
      expect((await call("POST", "/profile/email-change", cookie, {})).statusCode).toBe(400);
    });

    it("answers the same, and sends nothing, for the current address or one that has an account", async () => {
      const { cookie } = await signUp();
      await signUp("outra@email.com");
      const spies = await mailer();

      const same = await request(cookie, "MARINA@email.com");
      const taken = await request(cookie, "outra@email.com");
      const free = await request(cookie, "livre@email.com");

      expect(same.statusCode).toBe(200);
      expect(taken.statusCode).toBe(200);
      expect(free.statusCode).toBe(200);
      expect(spies.change).toHaveBeenCalledTimes(1);
      expect(spies.change.mock.calls[0][0]).toBe("livre@email.com");
      expect(await sql`select 1 from email_change_tokens`).toHaveLength(1);
    });

    it("keeps one live link: a new request replaces the previous one", async () => {
      const { cookie } = await signUp();
      const first = await requestToken(cookie, "primeiro@email.com");
      const second = await requestToken(cookie, "segundo@email.com");

      expect(await sql`select 1 from email_change_tokens`).toHaveLength(1);
      expect((await call("GET", `/auth/email-change/${first.token}`)).statusCode).toBe(410);
      expect((await call("GET", `/auth/email-change/${second.token}`)).json()).toEqual({
        email: "segundo@email.com",
      });
    });

    it("limits how many changes one account can ask for", async () => {
      const { cookie } = await signUp();
      await mailer();
      for (const n of [1, 2, 3])
        expect((await request(cookie, `n${n}@email.com`)).statusCode).toBe(200);
      expect((await request(cookie, "n4@email.com")).statusCode).toBe(429);
    });
  });

  describe("GET /auth/email-change/:token", () => {
    it("shows the address of a live link, without needing a session", async () => {
      const { cookie } = await signUp();
      const { token } = await requestToken(cookie);
      const response = await call("GET", `/auth/email-change/${token}`);
      expect(response.statusCode).toBe(200);
      expect(emailChangeTokenSchema.parse(response.json())).toEqual({ email: "novo@email.com" });
    });

    it("answers 410 for an unknown or expired link, and does not consume it", async () => {
      const { cookie } = await signUp();
      const { token } = await requestToken(cookie);
      expect((await call("GET", "/auth/email-change/unknown")).statusCode).toBe(410);

      await call("GET", `/auth/email-change/${token}`);
      expect((await call("GET", `/auth/email-change/${token}`)).statusCode).toBe(200);

      await sql`update email_change_tokens set expires_at = now() - interval '1 minute'`;
      expect((await call("GET", `/auth/email-change/${token}`)).statusCode).toBe(410);
    });
  });

  describe("POST /auth/email-change/confirm", () => {
    it("switches the account to the new address and tells the old one", async () => {
      const { cookie } = await signUp();
      const { token, changed } = await requestToken(cookie);

      const response = await confirm(token!);
      expect(response.statusCode).toBe(200);
      expect(emailChangedSchema.parse(response.json())).toEqual({ email: "novo@email.com" });
      expect(changed).toHaveBeenCalledWith("marina@email.com", "novo@email.com");

      const [user] = await sql`select email, email_verified_at from users`;
      expect(user.email).toBe("novo@email.com");
      expect(user.email_verified_at).not.toBeNull();
    });

    it("signs the account in with the new address only, and ends every session", async () => {
      const { cookie } = await signUp();
      const { token } = await requestToken(cookie);
      expect((await call("GET", "/auth/session", cookie)).statusCode).toBe(200);

      await confirm(token!);

      expect((await call("GET", "/auth/session", cookie)).statusCode).toBe(401);
      const oldLogin = await call("POST", "/auth/sign-in", undefined, {
        email: "marina@email.com",
        password: PASSWORD,
      });
      expect(oldLogin.statusCode).toBe(401);
      const newLogin = await call("POST", "/auth/sign-in", undefined, {
        email: "novo@email.com",
        password: PASSWORD,
      });
      expect(newLogin.statusCode).toBe(200);
      expect(newLogin.json()).toMatchObject({ email: "novo@email.com", emailVerified: true });
    });

    it("clears the browser's cookie when it comes with the request", async () => {
      const { cookie } = await signUp();
      const { token } = await requestToken(cookie);
      const response = await confirm(token!, cookie);
      expect(response.cookies.find((item) => item.name === "bordo_session")?.value).toBe("");
    });

    it("also drops pending recovery links, which were sent to the old address", async () => {
      const { id, cookie } = await signUp();
      await sql`insert into password_reset_tokens (token_hash, user_id, expires_at) values ('h', ${id}, now() + interval '1 hour')`;
      const { token } = await requestToken(cookie);
      await confirm(token!);
      expect(await sql`select 1 from password_reset_tokens`).toHaveLength(0);
    });

    it("works only once", async () => {
      const { cookie } = await signUp();
      const { token } = await requestToken(cookie);
      expect((await confirm(token!)).statusCode).toBe(200);
      expect((await confirm(token!)).statusCode).toBe(410);
      expect((await call("GET", `/auth/email-change/${token}`)).statusCode).toBe(410);
    });

    it("answers 410 for an unknown or expired link and 400 for a body without token", async () => {
      const { cookie } = await signUp();
      const { token } = await requestToken(cookie);
      expect((await confirm("unknown")).statusCode).toBe(410);
      expect((await call("POST", "/auth/email-change/confirm", undefined, {})).statusCode).toBe(
        400,
      );

      await sql`update email_change_tokens set expires_at = now() - interval '1 minute'`;
      expect((await confirm(token!)).statusCode).toBe(410);
      const [user] = await sql`select email from users`;
      expect(user.email).toBe("marina@email.com");
    });

    it("answers 409 and changes nothing when someone took the address meanwhile", async () => {
      const { cookie } = await signUp();
      const { token, changed } = await requestToken(cookie);
      await signUp("novo@email.com");

      const response = await confirm(token!);
      expect(response.statusCode).toBe(409);
      expect(changed).not.toHaveBeenCalled();
      const users = await sql`select email from users order by email`;
      expect(users.map((user) => user.email)).toEqual(["marina@email.com", "novo@email.com"]);
      expect((await call("GET", "/auth/session", cookie)).statusCode).toBe(200);
      const [{ used_at }] = await sql`select used_at from email_change_tokens`;
      expect(used_at).toBeNull();
    });

    it("limits attempts per address", async () => {
      for (let attempt = 0; attempt < 10; attempt++) {
        expect((await confirm(`guess-${attempt}`)).statusCode).toBe(410);
      }
      expect((await confirm("one-more")).statusCode).toBe(429);
    });
  });
});
