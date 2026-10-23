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

  http.get("/api/trips/:tripId/base-costs", ({ params }) =>
    HttpResponse.json(
      db.expenses.filter((expense) => expense.tripId === params.tripId && expense.kind === "BASE"),
    ),
  ),
];
