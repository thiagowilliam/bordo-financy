import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import postgres from "postgres";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, inject, it } from "vitest";
import { categorySchema, deletedCategorySchema } from "@bordo/shared/categories";
import { z } from "zod";

import { createTestApp } from "./helpers/create-test-app.js";

const databaseUrl = inject("testDatabaseUrl");
const PASSWORD = "Senha-forte-1";
const categoryList = z.array(categorySchema);

describe.skipIf(!databaseUrl)("categories (real Postgres)", () => {
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

  const list = async (cookie: string) =>
    categoryList.parse((await call("GET", "/categories", cookie)).json());

  const newCategory = { name: "Combustível", icon: "fuel", color: 4, kind: "DAILY" };

  /** A trip with one expense in `categoryId`, straight into the tables. */
  async function seedExpense(userId: string, categoryId: string, kind: "DAILY" | "BASE" = "DAILY") {
    const [{ id: tripId }] = await sql`
      insert into trips (user_id, name, destination, start_date, end_date, currency, budget_cents)
      values (${userId}, 'Lisboa', 'Portugal', '2026-10-12', '2026-10-26', 'EUR', 100000) returning id`;
    await sql`
      insert into expenses (trip_id, kind, category_id, payment_method, amount_cents, currency, spent_at, description)
      values (${tripId}, ${kind}, ${categoryId}, 'CASH', 500, 'EUR', '2026-10-12', 'Café')`;
  }

  it("requires a session on every route", async () => {
    const id = "00000000-0000-7000-8000-000000000001";
    expect((await call("GET", "/categories")).statusCode).toBe(401);
    expect((await call("POST", "/categories", undefined, newCategory)).statusCode).toBe(401);
    expect((await call("PUT", `/categories/${id}`)).statusCode).toBe(401);
    expect((await call("PUT", `/categories/${id}/hidden`)).statusCode).toBe(401);
    expect((await call("DELETE", `/categories/${id}`)).statusCode).toBe(401);
  });

  describe("GET /categories", () => {
    it("gives a new account its own copy of the defaults, daily first, in order", async () => {
      const { cookie } = await signUp();
      const categories = await list(cookie);

      expect(categories).toHaveLength(11);
      expect(categories.every((category) => category.isDefault && !category.hidden)).toBe(true);
      expect(categories.map((category) => category.name)).toEqual([
        "Alimentação",
        "Passeios",
        "Transporte",
        "Compras",
        "Saúde e outros",
        "Passagem aérea",
        "Hospedagem",
        "Aluguel de carro",
        "Seguro viagem",
        "Documentação",
        "Outros",
      ]);
      expect(categories.slice(0, 5).every((category) => category.kind === "DAILY")).toBe(true);
    });

    it("lists a custom category after the defaults of its kind", async () => {
      const { cookie } = await signUp();
      await call("POST", "/categories", cookie, newCategory);
      const names = (await list(cookie)).map((category) => category.name);
      expect(names.slice(0, 6)).toEqual([
        "Alimentação",
        "Passeios",
        "Transporte",
        "Compras",
        "Saúde e outros",
        "Combustível",
      ]);
    });

    it("never shows another user's categories", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      await call("POST", "/categories", other.cookie, { ...newCategory, name: "Só da outra" });

      const mine = await list(marina.cookie);
      expect(mine.map((category) => category.name)).not.toContain("Só da outra");
      const ids = new Set(mine.map((category) => category.id));
      const theirs = await list(other.cookie);
      expect(theirs.some((category) => ids.has(category.id))).toBe(false);
    });
  });

  describe("POST /categories", () => {
    it("creates a custom category owned by the user", async () => {
      const { cookie } = await signUp();
      const response = await call("POST", "/categories", cookie, {
        ...newCategory,
        name: "  Combustível ",
      });
      expect(response.statusCode).toBe(201);
      expect(categorySchema.parse(response.json())).toMatchObject({
        name: "Combustível",
        kind: "DAILY",
        isDefault: false,
        hidden: false,
      });
      expect(await list(cookie)).toHaveLength(12);
    });

    it("validates the body", async () => {
      const { cookie } = await signUp();
      const bad = [
        { ...newCategory, name: " " },
        { ...newCategory, icon: "rocket" },
        { ...newCategory, color: 9 },
        { ...newCategory, kind: "OTHER" },
      ];
      for (const body of bad) {
        expect((await call("POST", "/categories", cookie, body)).statusCode).toBe(400);
      }
    });

    it("ignores isDefault, hidden and userId sent by the client", async () => {
      const { cookie, id } = await signUp();
      const other = await signUp("outra@email.com");
      const response = await call("POST", "/categories", cookie, {
        ...newCategory,
        isDefault: true,
        hidden: true,
        userId: other.id,
      });
      expect(response.json()).toMatchObject({ isDefault: false, hidden: false });
      const rows = await sql`select user_id from categories where id = ${response.json().id}`;
      expect(rows[0].user_id).toBe(id);
    });
  });

  describe("PUT /categories/:id", () => {
    it("edits a category, defaults included", async () => {
      const { cookie } = await signUp();
      const [food] = await list(cookie);
      const response = await call("PUT", `/categories/${food.id}`, cookie, {
        name: "Comida",
        icon: "coffee",
        color: 5,
      });
      expect(response.statusCode).toBe(200);
      expect(response.json()).toMatchObject({
        id: food.id,
        name: "Comida",
        icon: "coffee",
        color: 5,
        isDefault: true,
        kind: "DAILY",
      });
    });

    it("editing a default does not change anyone else's copy", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      const [food] = await list(marina.cookie);
      await call("PUT", `/categories/${food.id}`, marina.cookie, {
        name: "Comida",
        icon: "coffee",
        color: 5,
      });
      expect((await list(other.cookie))[0].name).toBe("Alimentação");
    });

    it("answers 404 for another user's category and 400 for a malformed id", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      const [theirs] = await list(other.cookie);
      const body = { name: "X", icon: "tag", color: 1 };

      expect((await call("PUT", `/categories/${theirs.id}`, marina.cookie, body)).statusCode).toBe(
        404,
      );
      expect((await list(other.cookie))[0].name).toBe("Alimentação");
      expect((await call("PUT", "/categories/nope", marina.cookie, body)).statusCode).toBe(400);
    });

    it("cannot change the kind", async () => {
      const { cookie } = await signUp();
      const [food] = await list(cookie);
      await call("PUT", `/categories/${food.id}`, cookie, {
        name: "Comida",
        icon: "coffee",
        color: 5,
        kind: "BASE",
      });
      expect((await list(cookie))[0].kind).toBe("DAILY");
    });
  });

  describe("PUT /categories/:id/hidden", () => {
    it("hides and shows a category, only for this user", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      const [food] = await list(marina.cookie);

      const hidden = await call("PUT", `/categories/${food.id}/hidden`, marina.cookie, {
        hidden: true,
      });
      expect(hidden.json()).toMatchObject({ id: food.id, hidden: true });
      expect((await list(marina.cookie))[0].hidden).toBe(true);
      expect((await list(other.cookie))[0].hidden).toBe(false);

      const shown = await call("PUT", `/categories/${food.id}/hidden`, marina.cookie, {
        hidden: false,
      });
      expect(shown.json().hidden).toBe(false);
    });

    it("rejects a body without a boolean and another user's category", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      const [mine] = await list(marina.cookie);
      const [theirs] = await list(other.cookie);
      expect(
        (await call("PUT", `/categories/${mine.id}/hidden`, marina.cookie, {})).statusCode,
      ).toBe(400);
      expect(
        (await call("PUT", `/categories/${theirs.id}/hidden`, marina.cookie, { hidden: true }))
          .statusCode,
      ).toBe(404);
    });
  });

  describe("DELETE /categories/:id", () => {
    it("deletes an unused custom category", async () => {
      const { cookie } = await signUp();
      const created = (await call("POST", "/categories", cookie, newCategory)).json();
      const response = await call("DELETE", `/categories/${created.id}`, cookie);
      expect(response.statusCode).toBe(200);
      expect(deletedCategorySchema.parse(response.json())).toEqual({
        id: created.id,
        movedExpenses: 0,
      });
      expect(await list(cookie)).toHaveLength(11);
    });

    it("never deletes a default category", async () => {
      const { cookie } = await signUp();
      const [food] = await list(cookie);
      expect((await call("DELETE", `/categories/${food.id}`, cookie)).statusCode).toBe(409);
      expect(await list(cookie)).toHaveLength(11);
    });

    it("moves the expenses to another category of the same kind, then deletes", async () => {
      const { cookie, id } = await signUp();
      const created = (await call("POST", "/categories", cookie, newCategory)).json();
      const [food] = await list(cookie);
      await seedExpense(id, created.id);
      await seedExpense(id, created.id);

      const response = await call("DELETE", `/categories/${created.id}?moveTo=${food.id}`, cookie);
      expect(response.statusCode).toBe(200);
      expect(response.json()).toEqual({ id: created.id, movedExpenses: 2 });

      const rows = await sql`select category_id from expenses`;
      expect(rows.map((row) => row.category_id)).toEqual([food.id, food.id]);
      expect(await sql`select 1 from categories where id = ${created.id}`).toHaveLength(0);
    });

    it("refuses when expenses use it and the target is missing, itself, another kind or not the user's", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      const created = (await call("POST", "/categories", marina.cookie, newCategory)).json();
      const baseDefault = (await list(marina.cookie)).find((category) => category.kind === "BASE")!;
      const [theirs] = await list(other.cookie);
      await seedExpense(marina.id, created.id);

      const targets = [
        "",
        `?moveTo=${created.id}`,
        `?moveTo=${baseDefault.id}`,
        `?moveTo=${theirs.id}`,
      ];
      for (const query of targets) {
        const response = await call("DELETE", `/categories/${created.id}${query}`, marina.cookie);
        expect(response.statusCode).toBe(422);
      }
      expect(await sql`select 1 from categories where id = ${created.id}`).toHaveLength(1);
      expect(await sql`select 1 from expenses where category_id = ${created.id}`).toHaveLength(1);
    });

    it("answers 404 for another user's category and leaves it alone", async () => {
      const marina = await signUp("marina@email.com");
      const other = await signUp("outra@email.com");
      const created = (await call("POST", "/categories", other.cookie, newCategory)).json();
      expect((await call("DELETE", `/categories/${created.id}`, marina.cookie)).statusCode).toBe(
        404,
      );
      expect(await sql`select 1 from categories where id = ${created.id}`).toHaveLength(1);
    });
  });
});
