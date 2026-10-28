import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import postgres from "postgres";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { baseCostSchema } from "@bordo/shared/base-costs";
import { deletedExpenseSchema, expenseSchema } from "@bordo/shared/expenses";
import { z } from "zod";

import { createTestApp } from "./helpers/create-test-app.js";

const databaseUrl = inject("testDatabaseUrl");
const PASSWORD = "Senha-forte-1";
const expenseList = z.array(expenseSchema);

type Method = "GET" | "POST" | "PUT" | "DELETE";

describe.skipIf(!databaseUrl)("expenses and base costs (real Postgres)", () => {
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

  const call = (method: Method, url: string, cookie?: string, payload?: object) =>
    app.inject({ method, url: `/api${url}`, headers: cookie ? { cookie } : {}, payload });

  const categoryId = async (userId: string, name: string) => {
    const [row] = await sql`select id from categories where user_id = ${userId} and name = ${name}`;
    return row.id as string;
  };

  const newTrip = async (userId: string, currency = "EUR") => {
    const [row] = await sql`
      insert into trips (user_id, name, destination, start_date, end_date, currency, budget_cents)
      values (${userId}, 'Lisboa', 'Portugal', '2026-10-12', '2026-10-26', ${currency}, 500000)
      returning id`;
    return row.id as string;
  };

  /** A signed-in user with a trip in EUR and handles to some of their categories. */
  async function setup(email = "marina@email.com", currency = "EUR") {
    const user = await signUp(email);
    const tripId = await newTrip(user.id, currency);
    return {
      ...user,
      tripId,
      food: await categoryId(user.id, "Alimentação"),
      sights: await categoryId(user.id, "Passeios"),
      hotel: await categoryId(user.id, "Hospedagem"),
    };
  }

  type Ctx = Awaited<ReturnType<typeof setup>>;

  const daily = (ctx: Ctx, extra: object = {}) => ({
    tripId: ctx.tripId,
    kind: "DAILY",
    categoryId: ctx.food,
    paymentMethod: "CASH",
    amountInCents: 1250,
    currency: "EUR",
    date: "2026-10-13",
    description: "Pastel de nata",
    ...extra,
  });

  const base = (ctx: Ctx, extra: object = {}) =>
    daily(ctx, {
      kind: "BASE",
      categoryId: ctx.hotel,
      paymentMethod: "INTERNATIONAL_CARD",
      amountInCents: 74000,
      date: "2026-03-02",
      description: "Apartamento em Alfama",
      ...extra,
    });

  const create = (ctx: Ctx, body: object) =>
    call("POST", `/trips/${ctx.tripId}/expenses`, ctx.cookie, body);

  it("requires a session on every route", async () => {
    const trip = "00000000-0000-7000-8000-000000000001";
    const id = "00000000-0000-7000-8000-000000000002";
    expect((await call("GET", `/trips/${trip}/expenses`)).statusCode).toBe(401);
    expect((await call("POST", `/trips/${trip}/expenses`, undefined, {})).statusCode).toBe(401);
    expect((await call("PUT", `/trips/${trip}/expenses/${id}`, undefined, {})).statusCode).toBe(
      401,
    );
    expect((await call("DELETE", `/trips/${trip}/expenses/${id}`)).statusCode).toBe(401);
    expect((await call("GET", `/trips/${trip}/base-costs`)).statusCode).toBe(401);
  });

  describe("POST /trips/:tripId/expenses", () => {
    it("creates an expense in the trip and answers 201 in the shared shape", async () => {
      const ctx = await setup();
      const response = await create(ctx, daily(ctx, { description: "  Pastel de nata " }));
      expect(response.statusCode).toBe(201);
      expect(expenseSchema.parse(response.json())).toMatchObject({
        tripId: ctx.tripId,
        kind: "DAILY",
        amountInCents: 1250,
        currency: "EUR",
        date: "2026-10-13",
        description: "Pastel de nata",
      });
      expect(await sql`select 1 from expenses`).toHaveLength(1);
    });

    it("takes the trip from the path, whatever the body says", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      const response = await create(ctx, daily(ctx, { tripId: other.tripId }));
      expect(response.statusCode).toBe(201);
      expect(response.json().tripId).toBe(ctx.tripId);
      expect(await sql`select 1 from expenses where trip_id = ${other.tripId}`).toHaveLength(0);
    });

    it("validates the body with the field paths", async () => {
      const ctx = await setup();
      const invalid = [
        { body: daily(ctx, { amountInCents: 0 }), path: "amountInCents" },
        { body: daily(ctx, { amountInCents: 10.5 }), path: "amountInCents" },
        { body: daily(ctx, { description: "   " }), path: "description" },
        { body: daily(ctx, { date: "13/10/2026" }), path: "date" },
        { body: daily(ctx, { paymentMethod: "BITCOIN" }), path: "paymentMethod" },
        { body: daily(ctx, { kind: "OTHER" }), path: "kind" },
      ];
      for (const { body, path } of invalid) {
        const response = await create(ctx, body);
        expect(response.statusCode).toBe(400);
        expect(response.json().issues.map((issue: { path: string }) => issue.path)).toContain(path);
      }
      expect(await sql`select 1 from expenses`).toHaveLength(0);
    });

    it("rejects a currency different from the trip's", async () => {
      const ctx = await setup();
      const response = await create(ctx, daily(ctx, { currency: "USD" }));
      expect(response.statusCode).toBe(422);
    });

    it("rejects a category that is not the user's, unknown, of another kind or hidden", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      await sql`update categories set hidden = true where id = ${ctx.sights}`;

      const cases = [
        daily(ctx, { categoryId: other.food }),
        daily(ctx, { categoryId: "00000000-0000-7000-8000-000000000009" }),
        daily(ctx, { categoryId: ctx.hotel }),
        daily(ctx, { categoryId: ctx.sights }),
      ];
      for (const body of cases) expect((await create(ctx, body)).statusCode).toBe(422);
      expect(await sql`select 1 from expenses`).toHaveLength(0);
    });

    it("answers 404 for another user's trip and 400 for a malformed id", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      const intruder = await call(
        "POST",
        `/trips/${other.tripId}/expenses`,
        ctx.cookie,
        daily(ctx),
      );
      expect(intruder.statusCode).toBe(404);
      expect(await sql`select 1 from expenses`).toHaveLength(0);
      expect((await call("POST", "/trips/nope/expenses", ctx.cookie, daily(ctx))).statusCode).toBe(
        400,
      );
    });

    it("creates a base cost with kind BASE", async () => {
      const ctx = await setup();
      const response = await create(ctx, base(ctx));
      expect(response.statusCode).toBe(201);
      expect(baseCostSchema.parse(response.json())).toMatchObject({
        kind: "BASE",
        date: "2026-03-02",
      });
    });
  });

  describe("GET /trips/:tripId/expenses", () => {
    async function fill(ctx: Ctx) {
      await create(
        ctx,
        daily(ctx, { date: "2026-10-12", description: "Café", amountInCents: 300 }),
      );
      await create(
        ctx,
        daily(ctx, {
          date: "2026-10-14",
          description: "Jantar 50% off",
          categoryId: ctx.sights,
          paymentMethod: "PIX",
        }),
      );
      await create(
        ctx,
        daily(ctx, { date: "2026-10-13", description: "Almoço", paymentMethod: "DEBIT" }),
      );
      await create(ctx, base(ctx));
    }

    const list = async (ctx: Ctx, query = "") =>
      expenseList.parse(
        (await call("GET", `/trips/${ctx.tripId}/expenses${query}`, ctx.cookie)).json(),
      );

    it("lists everything of the trip, newest date first", async () => {
      const ctx = await setup();
      await fill(ctx);
      const all = await list(ctx);
      expect(all.map((expense) => expense.date)).toEqual([
        "2026-10-14",
        "2026-10-13",
        "2026-10-12",
        "2026-03-02",
      ]);
    });

    it("filters by kind, search, categories, period and payment method", async () => {
      const ctx = await setup();
      await fill(ctx);

      expect((await list(ctx, "?kind=DAILY")).map((e) => e.description)).toEqual([
        "Jantar 50% off",
        "Almoço",
        "Café",
      ]);
      expect((await list(ctx, "?kind=BASE")).map((e) => e.description)).toEqual([
        "Apartamento em Alfama",
      ]);
      expect((await list(ctx, "?search=caf")).map((e) => e.description)).toEqual(["Café"]);
      expect((await list(ctx, `?categories=${ctx.sights}`)).map((e) => e.description)).toEqual([
        "Jantar 50% off",
      ]);
      expect(
        (await list(ctx, `?categories=${ctx.sights},${ctx.hotel}`)).map((e) => e.description),
      ).toEqual(["Jantar 50% off", "Apartamento em Alfama"]);
      expect((await list(ctx, "?from=2026-10-13&to=2026-10-13")).map((e) => e.description)).toEqual(
        ["Almoço"],
      );
      expect((await list(ctx, "?paymentMethod=PIX")).map((e) => e.description)).toEqual([
        "Jantar 50% off",
      ]);
    });

    it("treats % and _ in the search as plain text", async () => {
      const ctx = await setup();
      await fill(ctx);
      expect((await list(ctx, "?search=50%25")).map((e) => e.description)).toEqual([
        "Jantar 50% off",
      ]);
      expect(await list(ctx, "?search=%25")).toHaveLength(1);
      expect(await list(ctx, "?search=_")).toHaveLength(0);
    });

    it("rejects bad filters with 400", async () => {
      const ctx = await setup();
      for (const query of ["?categories=nope", "?from=ontem", "?paymentMethod=X", "?kind=Y"]) {
        expect(
          (await call("GET", `/trips/${ctx.tripId}/expenses${query}`, ctx.cookie)).statusCode,
        ).toBe(400);
      }
    });

    it("never returns another user's expenses, even from their trip id", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      await create(other, daily(other, { description: "Da outra" }));

      expect(await list(ctx)).toEqual([]);
      const intruder = await call("GET", `/trips/${other.tripId}/expenses`, ctx.cookie);
      expect(intruder.statusCode).toBe(404);
    });
  });

  describe("PUT /trips/:tripId/expenses/:id", () => {
    it("replaces the expense", async () => {
      const ctx = await setup();
      const created = (await create(ctx, daily(ctx))).json();
      const response = await call(
        "PUT",
        `/trips/${ctx.tripId}/expenses/${created.id}`,
        ctx.cookie,
        daily(ctx, {
          amountInCents: 2000,
          description: "Pastéis",
          categoryId: ctx.sights,
          paymentMethod: "PIX",
          date: "2026-10-15",
        }),
      );
      expect(response.statusCode).toBe(200);
      expect(expenseSchema.parse(response.json())).toMatchObject({
        id: created.id,
        amountInCents: 2000,
        description: "Pastéis",
        categoryId: ctx.sights,
        paymentMethod: "PIX",
        date: "2026-10-15",
      });
    });

    it("keeps a hidden category on an existing expense but does not accept it as a change", async () => {
      const ctx = await setup();
      const created = (await create(ctx, daily(ctx))).json();
      await sql`update categories set hidden = true where id in (${ctx.food}, ${ctx.sights})`;

      const same = await call(
        "PUT",
        `/trips/${ctx.tripId}/expenses/${created.id}`,
        ctx.cookie,
        daily(ctx, { amountInCents: 1300 }),
      );
      expect(same.statusCode).toBe(200);
      const moved = await call(
        "PUT",
        `/trips/${ctx.tripId}/expenses/${created.id}`,
        ctx.cookie,
        daily(ctx, { categoryId: ctx.sights }),
      );
      expect(moved.statusCode).toBe(422);
    });

    it("answers 404 for an unknown expense, another trip's expense or another user's", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      const theirs = (await create(other, daily(other))).json();
      const mine = (await create(ctx, daily(ctx))).json();
      const secondTrip = await newTrip(ctx.id);

      expect(
        (await call("PUT", `/trips/${ctx.tripId}/expenses/${theirs.id}`, ctx.cookie, daily(ctx)))
          .statusCode,
      ).toBe(404);
      expect(
        (await call("PUT", `/trips/${other.tripId}/expenses/${theirs.id}`, ctx.cookie, daily(ctx)))
          .statusCode,
      ).toBe(404);
      expect(
        (await call("PUT", `/trips/${secondTrip}/expenses/${mine.id}`, ctx.cookie, daily(ctx)))
          .statusCode,
      ).toBe(404);
      expect(
        (await sql`select description from expenses where id = ${theirs.id}`)[0].description,
      ).toBe("Pastel de nata");
    });
  });

  describe("DELETE /trips/:tripId/expenses/:id", () => {
    it("deletes an expense", async () => {
      const ctx = await setup();
      const created = (await create(ctx, daily(ctx))).json();
      const response = await call(
        "DELETE",
        `/trips/${ctx.tripId}/expenses/${created.id}`,
        ctx.cookie,
      );
      expect(response.statusCode).toBe(200);
      expect(deletedExpenseSchema.parse(response.json())).toEqual({ id: created.id });
      expect(await sql`select 1 from expenses`).toHaveLength(0);
    });

    it("answers 404 and leaves it alone when it is not the user's", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      const theirs = (await create(other, daily(other))).json();
      expect(
        (await call("DELETE", `/trips/${other.tripId}/expenses/${theirs.id}`, ctx.cookie))
          .statusCode,
      ).toBe(404);
      expect(
        (await call("DELETE", `/trips/${ctx.tripId}/expenses/${theirs.id}`, ctx.cookie)).statusCode,
      ).toBe(404);
      expect(await sql`select 1 from expenses`).toHaveLength(1);
    });
  });

  describe("GET /trips/:tripId/base-costs", () => {
    it("lists only the BASE expenses, oldest first", async () => {
      const ctx = await setup();
      await create(ctx, daily(ctx));
      await create(ctx, base(ctx, { date: "2026-03-02", description: "Hotel" }));
      await create(
        ctx,
        base(ctx, {
          date: "2026-02-10",
          description: "Passagem",
          categoryId: await categoryId(ctx.id, "Passagem aérea"),
        }),
      );

      const response = await call("GET", `/trips/${ctx.tripId}/base-costs`, ctx.cookie);
      expect(response.statusCode).toBe(200);
      const costs = z.array(baseCostSchema).parse(response.json());
      expect(costs.map((cost) => cost.description)).toEqual(["Passagem", "Hotel"]);
    });

    it("answers 404 for another user's trip", async () => {
      const ctx = await setup();
      const other = await setup("outra@email.com");
      expect((await call("GET", `/trips/${other.tripId}/base-costs`, ctx.cookie)).statusCode).toBe(
        404,
      );
    });
  });

  describe("effects on other modules", () => {
    it("shows up in the trip's spent total and moves with a deleted category", async () => {
      const ctx = await setup();
      const custom = (
        await call("POST", "/categories", ctx.cookie, {
          name: "Combustível",
          icon: "fuel",
          color: 4,
          kind: "DAILY",
        })
      ).json();
      await create(ctx, daily(ctx, { categoryId: custom.id, amountInCents: 700 }));
      await create(ctx, daily(ctx, { amountInCents: 300 }));

      const trips = (await call("GET", "/trips", ctx.cookie)).json();
      expect(trips[0].spentInCents).toBe(1000);

      const deleted = await call(
        "DELETE",
        `/categories/${custom.id}?moveTo=${ctx.food}`,
        ctx.cookie,
      );
      expect(deleted.json()).toEqual({ id: custom.id, movedExpenses: 1 });
      const all = expenseList.parse(
        (await call("GET", `/trips/${ctx.tripId}/expenses`, ctx.cookie)).json(),
      );
      expect(all.every((expense) => expense.categoryId === ctx.food)).toBe(true);
    });
  });
});
