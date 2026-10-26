import { http, HttpResponse } from "msw/http";

import { createExpenseSchema } from "@/features/expenses";

import { db } from "./db";

export const expenseHandlers = [
  http.get("/api/trips/:tripId/expenses", ({ params, request }) => {
    const query = new URL(request.url).searchParams;
    const search = query.get("search")?.toLowerCase();
    const categories = query.get("categories")?.split(",");
    const from = query.get("from");
    const to = query.get("to");
    const paymentMethod = query.get("paymentMethod");
    const kind = query.get("kind");

    const expenses = db.expenses
      .filter((expense) => expense.tripId === params.tripId)
      .filter((expense) => !kind || expense.kind === kind)
      .filter((expense) => !search || expense.description.toLowerCase().includes(search))
      .filter((expense) => !categories || categories.includes(expense.categoryId))
      .filter((expense) => !from || expense.date >= from)
      .filter((expense) => !to || expense.date <= to)
      .filter((expense) => !paymentMethod || expense.paymentMethod === paymentMethod)
      .toSorted((a, b) => b.date.localeCompare(a.date));

    return HttpResponse.json(expenses);
  }),

  http.post("/api/trips/:tripId/expenses", async ({ params, request }) => {
    const input = createExpenseSchema.parse(await request.json());
    const expense = { ...input, tripId: String(params.tripId), id: `exp-${crypto.randomUUID()}` };
    db.expenses.push(expense);
    return HttpResponse.json(expense, { status: 201 });
  }),

  http.put("/api/trips/:tripId/expenses/:id", async ({ params, request }) => {
    const input = createExpenseSchema.parse(await request.json());
    const index = db.expenses.findIndex(
      (expense) => expense.id === params.id && expense.tripId === params.tripId,
    );
    if (index === -1) return new HttpResponse(null, { status: 404 });
    const expense = { ...input, tripId: String(params.tripId), id: String(params.id) };
    db.expenses[index] = expense;
    return HttpResponse.json(expense);
  }),

  http.delete("/api/trips/:tripId/expenses/:id", ({ params }) => {
    const index = db.expenses.findIndex(
      (expense) => expense.id === params.id && expense.tripId === params.tripId,
    );
    if (index === -1) return new HttpResponse(null, { status: 404 });
    db.expenses.splice(index, 1);
    return HttpResponse.json({ id: String(params.id) });
  }),

  http.get("/api/trips/:tripId/base-costs", ({ params }) =>
    HttpResponse.json(
      db.expenses.filter((expense) => expense.tripId === params.tripId && expense.kind === "BASE"),
    ),
  ),
];
