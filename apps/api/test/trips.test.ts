import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import postgres from "postgres";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { tripDetailSchema, tripSchema, tripSummarySchema } from "@bordo/shared/trips";
import { z } from "zod";

import { createTestApp } from "./helpers/create-test-app.js";

const databaseUrl = inject("testDatabaseUrl");
const PASSWORD = "Senha-forte-1";
const summaries = z.array(tripSummarySchema);

describe.skipIf(!databaseUrl)("trips (real Postgres)", () => {
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

  const signUp = async (email = "marina@email.com") => {
    const response = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up",
      payload: { email, password: PASSWORD },
    });
    const cookie = response.cookies.find((item) => item.name === "bordo_session")!;
    return { id: response.json().id as string, cookie: `bordo_session=${cookie.value}` };
  };

  const call = (
    method: "GET" | "POST" | "PUT" | "DELETE",
    url: string,
    cookie?: string,
    payload?: object,
  ) => app.inject({ method, url: `/api${url}`, headers: cookie ? { cookie } : {}, payload });

  const lisbon = {
    name: "Lisboa & Sintra",
    destination: "Portugal",
    startDate: "2026-10-12",
    endDate: "2026-10-26",
    budgetInCents: 500000,
    currency: "EUR",
  };

  /** Inserts a trip straight into the tables, with optional expenses and a cover photo URL. */
  async function seedTrip(
    userId: string,
    trip: { name: string; start: string; end: string; currency?: string },
    options: { spent?: number[]; cover?: string } = {},
  ) {
    const [{ id: tripId }] = await sql`
      insert into trips (user_id, name, destination, start_date, end_date, currency, budget_cents)
      values (${userId}, ${trip.name}, 'Destino', ${trip.start}, ${trip.end}, ${trip.currency ?? "EUR"}, 100000)
      returning id`;
    if (options.spent?.length) {
      const [{ id: categoryId }] = await sql`
        select id from categories where user_id = ${userId} and kind = 'DAILY' limit 1`;
      for (const cents of options.spent) {
        await sql`
          insert into expenses (trip_id, kind, category_id, payment_method, amount_cents, currency, spent_at, description)
          values (${tripId}, 'DAILY', ${categoryId}, 'CASH', ${cents}, ${trip.currency ?? "EUR"}, ${trip.start}, 'Gasto')`;
      }
    }
    if (options.cover) {
      const [{ id: photoId }] = await sql`
        insert into photos (trip_id, name, storage_key) values (${tripId}, 'capa.jpg', ${options.cover}) returning id`;
      await sql`update trips set cover_photo_id = ${photoId} where id = ${tripId}`;
    }
    return tripId as string;
  }

  it("requires a session on every route", async () => {
    expect((await call("GET", "/trips")).statusCode).toBe(401);
    expect((await call("GET", "/trips/00000000-0000-7000-8000-000000000001")).statusCode).toBe(401);
    expect((await call("POST", "/trips", undefined, lisbon)).statusCode).toBe(401);
  });

  describe("POST /trips", () => {
    it("creates a trip owned by the user, without a cover", async () => {
      const { cookie, id } = await signUp();
      const response = await call("POST", "/trips", cookie, {
        ...lisbon,
        name: "  Lisboa & Sintra ",
      });
      expect(response.statusCode).toBe(201);
      expect(tripSchema.parse(response.json())).toMatchObject({ ...lisbon, coverPhotoUrl: null });

      const rows = await sql`select user_id, budget_cents from trips`;
      expect(rows).toHaveLength(1);
      expect(rows[0].user_id).toBe(id);
      expect(Number(rows[0].budget_cents)).toBe(500000);
    });

    it("allows a one day trip and keeps the budget as integer minor units", async () => {
      const { cookie } = await signUp();
      const response = await call("POST", "/trips", cookie, {
        ...lisbon,
        endDate: lisbon.startDate,
        currency: "JPY",
        budgetInCents: 640000,
      });
      expect(response.statusCode).toBe(201);
      expect(response.json()).toMatchObject({ currency: "JPY", budgetInCents: 640000 });
    });

    it("validates the body with the field paths", async () => {
      const { cookie } = await signUp();
      const invalid = [
        { body: { ...lisbon, name: " " }, path: "name" },
        { body: { ...lisbon, destination: "" }, path: "destination" },
        { body: { ...lisbon, endDate: "2026-10-11" }, path: "endDate" },
        { body: { ...lisbon, startDate: "12/10/2026" }, path: "startDate" },
        { body: { ...lisbon, budgetInCents: 0 }, path: "budgetInCents" },
        { body: { ...lisbon, budgetInCents: 10.5 }, path: "budgetInCents" },
        { body: { ...lisbon, currency: "XXX" }, path: "currency" },
      ];
      for (const { body, path } of invalid) {
        const response = await call("POST", "/trips", cookie, body);
        expect(response.statusCode).toBe(400);
        expect(response.json().issues.map((issue: { path: string }) => issue.path)).toContain(path);
      }
      expect(await sql`select 1 from trips`).toHaveLength(0);
    });

    it("ignores the owner, the id and the cover sent by the client", async () => {
      const { cookie, id } = await signUp();
      const other = await signUp("outra@email.com");
      const response = await call("POST", "/trips", cookie, {
        ...lisbon,
        userId: other.id,
        id: "00000000-0000-7000-8000-000000000009",
        coverPhotoUrl: "https://evil.example/x.jpg",
      });
      expect(response.statusCode).toBe(201);
      expect(response.json().coverPhotoUrl).toBeNull();
      expect(response.json().id).not.toBe("00000000-0000-7000-8000-000000000009");
      const rows = await sql`select user_id from trips`;
      expect(rows[0].user_id).toBe(id);
    });
  });

  describe("GET /trips", () => {
    it("is empty for a new account", async () => {
      const { cookie } = await signUp();
      const response = await call("GET", "/trips", cookie);
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual([]);
    });

    it("lists the trips newest start date first, with spent and cover", async () => {
      const { cookie, id } = await signUp();
      await seedTrip(
        id,
        { name: "Bali", start: "2026-02-08", end: "2026-02-22" },
        { spent: [1000, 2500] },
      );
      await seedTrip(id, {
        name: "Kyoto",
        start: "2027-03-04",
        end: "2027-03-18",
        currency: "JPY",
      });
      await seedTrip(
        id,
        { name: "Lisboa", start: "2026-10-12", end: "2026-10-26" },
        { spent: [98000, 1234], cover: "https://images.unsplash.com/photo-1?w=800" },
      );

      const response = await call("GET", "/trips", cookie);
      expect(response.statusCode).toBe(200);
      const trips = summaries.parse(response.json());

      expect(trips.map((trip) => trip.name)).toEqual(["Kyoto", "Lisboa", "Bali"]);
      expect(trips.map((trip) => trip.spentInCents)).toEqual([0, 99234, 3500]);
      expect(trips.map((trip) => trip.coverPhotoUrl)).toEqual([
        null,
        "https://images.unsplash.com/photo-1?w=800",
        null,
      ]);
    });

    it("does not multiply the spent total when a trip has several expenses and a cover", async () => {
      const { cookie, id } = await signUp();
      await seedTrip(
        id,
        { name: "Lisboa", start: "2026-10-12", end: "2026-10-26" },
        { spent: [100, 100, 100, 100], cover: "https://images.unsplash.com/photo-1" },
      );
      expect((await call("GET", "/trips", cookie)).json()[0].spentInCents).toBe(400);
    });

    it("turns a storage key into a media url", async () => {
      const { cookie, id } = await signUp();
      await seedTrip(
        id,
        { name: "Lisboa", start: "2026-10-12", end: "2026-10-26" },
        { cover: "trips/abc/cover.jpg" },
      );
      expect((await call("GET", "/trips", cookie)).json()[0].coverPhotoUrl).toBe(
        "/api/media/trips/abc/cover.jpg",
      );
    });

    it("only lists the signed-in user's trips and expenses", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      await seedTrip(
        marina.id,
        { name: "Minha", start: "2026-10-12", end: "2026-10-26" },
        { spent: [100] },
      );
      await seedTrip(
        other.id,
        { name: "Da outra", start: "2026-10-12", end: "2026-10-26" },
        { spent: [999] },
      );

      const trips = (await call("GET", "/trips", marina.cookie)).json();
      expect(trips).toHaveLength(1);
      expect(trips[0]).toMatchObject({ name: "Minha", spentInCents: 100 });
    });
  });

  describe("GET /trips/:id", () => {
    it("returns one trip in the shared shape", async () => {
      const { cookie, id } = await signUp();
      const tripId = await seedTrip(
        id,
        { name: "Lisboa", start: "2026-10-12", end: "2026-10-26" },
        { cover: "https://images.unsplash.com/photo-1" },
      );
      const response = await call("GET", `/trips/${tripId}`, cookie);
      expect(response.statusCode).toBe(200);
      expect(tripDetailSchema.parse(response.json())).toMatchObject({
        id: tripId,
        lastBudgetChange: null,
        name: "Lisboa",
        budgetInCents: 100000,
        coverPhotoUrl: "https://images.unsplash.com/photo-1",
      });
    });

    it("answers 404 for another user's trip and for an unknown one, 400 for a malformed id", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      const theirs = await seedTrip(other.id, {
        name: "Da outra",
        start: "2026-10-12",
        end: "2026-10-26",
      });

      expect((await call("GET", `/trips/${theirs}`, marina.cookie)).statusCode).toBe(404);
      expect(
        (await call("GET", "/trips/00000000-0000-7000-8000-000000000001", marina.cookie))
          .statusCode,
      ).toBe(404);
      expect((await call("GET", "/trips/nope", marina.cookie)).statusCode).toBe(400);
    });
  });

  describe("PUT /trips/:id", () => {
    it("edits a trip of any status and keeps its cover", async () => {
      const { cookie, id } = await signUp();
      const tripId = await seedTrip(
        id,
        { name: "Antiga", start: "2020-01-01", end: "2020-01-10" },
        { cover: "https://images.unsplash.com/photo-1" },
      );
      const response = await call("PUT", `/trips/${tripId}`, cookie, {
        ...lisbon,
        name: "  Nova ",
        budgetInCents: 100000,
        startDate: "2020-01-02",
        endDate: "2020-01-12",
      });
      expect(response.statusCode).toBe(200);
      expect(tripDetailSchema.parse(response.json())).toMatchObject({
        id: tripId,
        name: "Nova",
        startDate: "2020-01-02",
        endDate: "2020-01-12",
        coverPhotoUrl: "https://images.unsplash.com/photo-1",
        lastBudgetChange: null,
      });
    });

    it("records a budget change only when the budget moved", async () => {
      const { cookie, id } = await signUp();
      const tripId = await seedTrip(id, { name: "Lisboa", start: "2026-10-12", end: "2026-10-26" });
      const edit = (budgetInCents: number) =>
        call("PUT", `/trips/${tripId}`, cookie, { ...lisbon, budgetInCents });

      await edit(100000);
      expect(await sql`select 1 from trip_budget_changes`).toHaveLength(0);

      const response = await edit(150000);
      expect(response.json().lastBudgetChange).toMatchObject({
        fromInCents: 100000,
        toInCents: 150000,
      });
      const get = await call("GET", `/trips/${tripId}`, cookie);
      expect(get.json().lastBudgetChange).toMatchObject({ fromInCents: 100000, toInCents: 150000 });
    });

    it("allows a budget below what was already spent", async () => {
      const { cookie, id } = await signUp();
      const tripId = await seedTrip(
        id,
        { name: "Lisboa", start: "2026-10-12", end: "2026-10-26" },
        { spent: [90000] },
      );
      const response = await call("PUT", `/trips/${tripId}`, cookie, {
        ...lisbon,
        budgetInCents: 50000,
      });
      expect(response.statusCode).toBe(200);
    });

    it("refuses dates that leave expenses outside the period", async () => {
      const { cookie, id } = await signUp();
      const tripId = await seedTrip(
        id,
        { name: "Lisboa", start: "2026-10-12", end: "2026-10-26" },
        { spent: [100, 200, 300] },
      );
      const response = await call("PUT", `/trips/${tripId}`, cookie, {
        ...lisbon,
        startDate: "2026-10-13",
      });
      expect(response.statusCode).toBe(409);
      expect(response.json().message).toContain("3 gastos");
      const [row] =
        await sql`select start_date::text as start_date from trips where id = ${tripId}`;
      expect(row.start_date).toBe("2026-10-12");
    });

    it("lets base costs paid before the trip stay outside the period", async () => {
      const { cookie, id } = await signUp();
      const tripId = await seedTrip(id, { name: "Lisboa", start: "2026-10-12", end: "2026-10-26" });
      const [{ id: categoryId }] =
        await sql`select id from categories where user_id = ${id} and kind = 'BASE' limit 1`;
      await sql`
      insert into expenses (trip_id, kind, category_id, payment_method, amount_cents, currency, spent_at, description)
      values (${tripId}, 'BASE', ${categoryId}, 'PIX', 100, 'EUR', '2026-03-01', 'Hotel')`;
      const response = await call("PUT", `/trips/${tripId}`, cookie, {
        ...lisbon,
        startDate: "2026-10-13",
      });
      expect(response.statusCode).toBe(200);
    });

    it("locks the currency once the trip has expenses", async () => {
      const { cookie, id } = await signUp();
      const withExpenses = await seedTrip(
        id,
        { name: "Com gastos", start: "2026-10-12", end: "2026-10-26" },
        { spent: [100] },
      );
      const empty = await seedTrip(id, { name: "Vazia", start: "2026-10-12", end: "2026-10-26" });

      const locked = await call("PUT", `/trips/${withExpenses}`, cookie, {
        ...lisbon,
        currency: "USD",
      });
      expect(locked.statusCode).toBe(409);
      const free = await call("PUT", `/trips/${empty}`, cookie, { ...lisbon, currency: "USD" });
      expect(free.statusCode).toBe(200);
      expect(free.json().currency).toBe("USD");
    });

    it("validates the body and hides other users' trips", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      const mine = await seedTrip(marina.id, {
        name: "Minha",
        start: "2026-10-12",
        end: "2026-10-26",
      });
      const theirs = await seedTrip(other.id, {
        name: "Da outra",
        start: "2026-10-12",
        end: "2026-10-26",
      });

      expect(
        (await call("PUT", `/trips/${mine}`, marina.cookie, { ...lisbon, endDate: "2026-10-01" }))
          .statusCode,
      ).toBe(400);
      expect((await call("PUT", `/trips/${theirs}`, marina.cookie, lisbon)).statusCode).toBe(404);
      expect((await call("PUT", `/trips/${mine}`, undefined, lisbon)).statusCode).toBe(401);
      const [row] = await sql`select name from trips where id = ${theirs}`;
      expect(row.name).toBe("Da outra");
    });
  });

  describe("DELETE /trips/:id", () => {
    it("deletes the trip with its expenses, photos and budget changes", async () => {
      const { cookie, id } = await signUp();
      const tripId = await seedTrip(
        id,
        { name: "Lisboa", start: "2026-10-12", end: "2026-10-26" },
        { spent: [100, 200], cover: "https://images.unsplash.com/photo-1" },
      );
      await call("PUT", `/trips/${tripId}`, cookie, { ...lisbon, budgetInCents: 123400 });
      const other = await seedTrip(id, { name: "Fica", start: "2026-11-01", end: "2026-11-05" });

      const response = await call("DELETE", `/trips/${tripId}`, cookie);
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ id: tripId });
      expect(await sql`select 1 from expenses where trip_id = ${tripId}`).toHaveLength(0);
      expect(await sql`select 1 from photos where trip_id = ${tripId}`).toHaveLength(0);
      expect(await sql`select 1 from trip_budget_changes`).toHaveLength(0);
      expect(await sql`select 1 from trips where id = ${other}`).toHaveLength(1);
      expect((await call("GET", `/trips/${tripId}`, cookie)).statusCode).toBe(404);
    });

    it("answers 404 for another user's trip and leaves it alone", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      const theirs = await seedTrip(other.id, {
        name: "Da outra",
        start: "2026-10-12",
        end: "2026-10-26",
      });
      expect((await call("DELETE", `/trips/${theirs}`, marina.cookie)).statusCode).toBe(404);
      expect(await sql`select 1 from trips where id = ${theirs}`).toHaveLength(1);
      expect((await call("DELETE", `/trips/${theirs}`)).statusCode).toBe(401);
    });
  });
});
