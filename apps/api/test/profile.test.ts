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
import { profileStatsSchema } from "@bordo/shared/profile";

import { createTestApp } from "./helpers/create-test-app.js";

const databaseUrl = inject("testDatabaseUrl");
const PASSWORD = "Senha-forte-1";

describe.skipIf(!databaseUrl)("profile (real Postgres)", () => {
  let sql: postgres.Sql;
  let app: NestFastifyApplication;

  beforeAll(() => {
    sql = postgres(databaseUrl!, { max: 2 });
  });
  afterAll(async () => {
    await sql.end();
  });
  beforeEach(async () => {
    await sql`truncate table users, categories cascade`;
    app = await createTestApp({ DATABASE_URL: databaseUrl! });
  });
  afterEach(async () => {
    await app.close();
  });

  const signUp = async (email = "marina@email.com") => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up",
      payload: { email, password: PASSWORD },
    });
    const cookie = response.cookies.find((item) => item.name === "bordo_session")!;
    return { id: response.json().id as string, cookie: `bordo_session=${cookie.value}` };
  };

  const request = (
    method: "GET" | "PATCH" | "POST" | "DELETE",
    url: string,
    cookie?: string,
    payload?: object,
  ) => app.inject({ method, url: `/api${url}`, headers: cookie ? { cookie } : {}, payload });

  /** A trip with expenses, straight into the tables: the trips and expenses endpoints come later. */
  async function seedTrip(
    userId: string,
    trip: { name: string; destination: string; start: string; end: string; currency: string },
    amounts: {
      cents: number;
      currency: string;
      description?: string;
      kind?: "DAILY" | "BASE";
    }[] = [],
  ) {
    const [{ id: categoryId }] = await sql`
      insert into categories (user_id, name, icon, color, kind) values (${userId}, 'Alimentação', 'utensils', 1, 'DAILY') returning id`;
    const [{ id: tripId }] = await sql`
      insert into trips (user_id, name, destination, start_date, end_date, currency, budget_cents)
      values (${userId}, ${trip.name}, ${trip.destination}, ${trip.start}, ${trip.end}, ${trip.currency}, 100000)
      returning id`;
    for (const amount of amounts) {
      await sql`
        insert into expenses (trip_id, kind, category_id, payment_method, amount_cents, currency, spent_at, description)
        values (${tripId}, ${amount.kind ?? "DAILY"}, ${categoryId}, 'CASH', ${amount.cents}, ${amount.currency}, ${trip.start}, ${amount.description ?? "Gasto"})`;
    }
    return tripId as string;
  }

  describe("GET /profile and PATCH /profile", () => {
    it("requires a session", async () => {
      expect((await request("GET", "/profile")).statusCode).toBe(401);
      expect((await request("GET", "/profile/stats")).statusCode).toBe(401);
      expect((await request("GET", "/profile/export")).statusCode).toBe(401);
      expect(
        (await request("PATCH", "/profile", undefined, { name: "A", currency: "BRL" })).statusCode,
      ).toBe(401);
      expect((await request("DELETE", "/profile")).statusCode).toBe(401);
    });

    it("returns the profile in the shared shape", async () => {
      const { cookie } = await signUp();
      const response = await request("GET", "/profile", cookie);
      expect(response.statusCode).toBe(200);
      expect(authUserSchema.parse(response.json())).toMatchObject({
        email: "marina@email.com",
        currency: "BRL",
        hasPassword: true,
      });
    });

    it("updates the name and the main currency", async () => {
      const { cookie } = await signUp();
      const response = await request("PATCH", "/profile", cookie, {
        name: "  Marina Duarte ",
        currency: "EUR",
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({ name: "Marina Duarte", currency: "EUR" });
      expect((await request("GET", "/profile", cookie)).json().currency).toBe("EUR");
    });

    it("rejects an empty name, an unsupported currency and unknown fields", async () => {
      const { cookie } = await signUp();
      const empty = await request("PATCH", "/profile", cookie, { name: " ", currency: "BRL" });
      expect(empty.statusCode).toBe(400);
      expect(empty.json().issues[0].path).toBe("name");
      const currency = await request("PATCH", "/profile", cookie, { name: "A", currency: "XXX" });
      expect(currency.statusCode).toBe(400);
    });

    it("does not let a body change the e-mail or the id", async () => {
      const { cookie, id } = await signUp();
      await request("PATCH", "/profile", cookie, {
        name: "Marina",
        currency: "BRL",
        email: "outro@email.com",
        id: "00000000-0000-0000-0000-000000000000",
      });
      const profile = (await request("GET", "/profile", cookie)).json();
      expect(profile).toMatchObject({ email: "marina@email.com", id });
    });
  });

  describe("GET /profile/stats", () => {
    it("is zero for a new account", async () => {
      const { cookie } = await signUp();
      const response = await request("GET", "/profile/stats", cookie);
      expect(profileStatsSchema.parse(response.json())).toEqual({
        trips: 0,
        daysTraveled: 0,
        destinations: 0,
        totalInCents: 0,
      });
    });

    it("counts trips, days, distinct destinations and the total in the main currency", async () => {
      const { cookie, id } = await signUp();
      await seedTrip(
        id,
        {
          name: "Lisboa",
          destination: "Portugal",
          start: "2026-10-12",
          end: "2026-10-26",
          currency: "BRL",
        },
        [
          { cents: 10000, currency: "BRL" },
          { cents: 2550, currency: "BRL" },
          { cents: 99999, currency: "EUR" },
        ],
      );
      await seedTrip(
        id,
        {
          name: "Porto",
          destination: " portugal ",
          start: "2027-01-01",
          end: "2027-01-01",
          currency: "BRL",
        },
        [{ cents: 500, currency: "BRL" }],
      );
      await seedTrip(id, {
        name: "Tóquio",
        destination: "Japão",
        start: "2027-03-04",
        end: "2027-03-08",
        currency: "JPY",
      });

      const stats = (await request("GET", "/profile/stats", cookie)).json();
      expect(stats).toEqual({
        trips: 3,
        daysTraveled: 15 + 1 + 5,
        destinations: 2,
        totalInCents: 13050,
      });
    });

    it("only counts the signed-in user's data", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      await seedTrip(
        other.id,
        {
          name: "Bali",
          destination: "Indonésia",
          start: "2026-02-08",
          end: "2026-02-22",
          currency: "BRL",
        },
        [{ cents: 5000, currency: "BRL" }],
      );
      const stats = (await request("GET", "/profile/stats", marina.cookie)).json();
      expect(stats).toMatchObject({ trips: 0, daysTraveled: 0, totalInCents: 0 });
    });
  });

  describe("GET /profile/export", () => {
    it("downloads a CSV with the user's expenses, with each currency's decimals", async () => {
      const { cookie, id } = await signUp();
      await seedTrip(
        id,
        {
          name: "Lisboa",
          destination: "Portugal",
          start: "2026-10-12",
          end: "2026-10-26",
          currency: "EUR",
        },
        [
          { cents: 98000, currency: "EUR", description: 'Passagem "ida"', kind: "BASE" },
          { cents: 1234, currency: "EUR", description: "Café" },
        ],
      );
      await seedTrip(
        id,
        {
          name: "Tóquio",
          destination: "Japão",
          start: "2027-03-04",
          end: "2027-03-08",
          currency: "JPY",
        },
        [{ cents: 4500, currency: "JPY", description: "Trem" }],
      );

      const response = await request("GET", "/profile/export", cookie);
      expect(response.statusCode).toBe(200);
      expect(response.headers["content-type"]).toBe("text/csv; charset=utf-8");
      expect(response.headers["content-disposition"]).toBe(
        'attachment; filename="bordo-gastos.csv"',
      );

      const lines = response.body.replace("﻿", "").trimEnd().split("\n");
      expect(lines[0]).toBe('"Viagem","Data","Tipo","Descrição","Valor","Moeda"');
      expect(lines).toContain(
        '"Lisboa","2026-10-12","Custo de base","Passagem ""ida""","980.00","EUR"',
      );
      expect(lines).toContain('"Lisboa","2026-10-12","Dia a dia","Café","12.34","EUR"');
      expect(lines).toContain('"Tóquio","2027-03-04","Dia a dia","Trem","4500","JPY"');
    });

    it("neutralizes text that a spreadsheet would run as a formula", async () => {
      const { cookie, id } = await signUp();
      await seedTrip(
        id,
        {
          name: "Lisboa",
          destination: "Portugal",
          start: "2026-10-12",
          end: "2026-10-26",
          currency: "EUR",
        },
        [{ cents: 100, currency: "EUR", description: '=HYPERLINK("http://evil")' }],
      );
      const body = (await request("GET", "/profile/export", cookie)).body;
      expect(body).toContain(`"'=HYPERLINK(""http://evil"")"`);
    });

    it("never includes another user's expenses", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      await seedTrip(
        other.id,
        {
          name: "Bali",
          destination: "Indonésia",
          start: "2026-02-08",
          end: "2026-02-22",
          currency: "BRL",
        },
        [{ cents: 5000, currency: "BRL" }],
      );
      const lines = (await request("GET", "/profile/export", marina.cookie)).body
        .trimEnd()
        .split("\n");
      expect(lines).toHaveLength(1);
    });
  });

  describe("POST /profile/password-reset", () => {
    it("e-mails a single use link to the signed-in user and it works", async () => {
      const { cookie } = await signUp();
      const { MailerService } = await import("../src/modules/auth/mailer.service.js");
      const send = vi.spyOn(app.get(MailerService), "sendPasswordReset").mockResolvedValue();

      const response = await request("POST", "/profile/password-reset", cookie);
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ email: "marina@email.com" });
      expect(send).toHaveBeenCalledTimes(1);
      expect(send.mock.calls[0][0]).toBe("marina@email.com");

      const token = new URL(send.mock.calls[0][1]).searchParams.get("token");
      const reset = await app.inject({
        method: "POST",
        url: "/api/auth/reset-password",
        payload: { token, password: "Nova-senha-9!" },
      });
      expect(reset.statusCode).toBe(200);
    });

    it("limits how many links one account can ask for", async () => {
      const { cookie } = await signUp();
      for (let attempt = 0; attempt < 3; attempt++) {
        expect((await request("POST", "/profile/password-reset", cookie)).statusCode).toBe(200);
      }
      expect((await request("POST", "/profile/password-reset", cookie)).statusCode).toBe(429);
    });
  });

  describe("DELETE /profile", () => {
    it("deletes the account and everything under it, and signs the browser out", async () => {
      const { cookie, id } = await signUp();
      const other = await signUp("outra@email.com");
      await seedTrip(
        id,
        {
          name: "Lisboa",
          destination: "Portugal",
          start: "2026-10-12",
          end: "2026-10-26",
          currency: "EUR",
        },
        [{ cents: 100, currency: "EUR" }],
      );
      await seedTrip(
        other.id,
        {
          name: "Bali",
          destination: "Indonésia",
          start: "2026-02-08",
          end: "2026-02-22",
          currency: "BRL",
        },
        [{ cents: 100, currency: "BRL" }],
      );

      const response = await request("DELETE", "/profile", cookie);
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ id });
      expect(response.cookies.find((item) => item.name === "bordo_session")?.value).toBe("");

      expect(await sql`select 1 from users where id = ${id}`).toHaveLength(0);
      expect(await sql`select 1 from sessions where user_id = ${id}`).toHaveLength(0);
      expect(await sql`select 1 from trips where user_id = ${id}`).toHaveLength(0);
      expect((await request("GET", "/profile", cookie)).statusCode).toBe(401);

      expect(await sql`select 1 from trips where user_id = ${other.id}`).toHaveLength(1);
      expect(await sql`select 1 from expenses`).toHaveLength(1);
    });
  });
});
