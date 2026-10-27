import { z } from "zod";

import { apiFetch } from "@/lib/api-client";

import { deletedExpenseSchema, expenseSchema } from "@bordo/shared/expenses";
import type { CreateExpenseInput, ExpenseFilters } from "../types";

export function fetchExpenses(tripId: string, filters: ExpenseFilters = {}) {
  const params = new URLSearchParams({ kind: "DAILY" });
  if (filters.search) params.set("search", filters.search);
  if (filters.categories?.length) params.set("categories", filters.categories.join(","));
  if (filters.from) params.set("from", filters.from);
  if (filters.to) params.set("to", filters.to);
  if (filters.paymentMethod) params.set("paymentMethod", filters.paymentMethod);
  return apiFetch(`/api/trips/${tripId}/expenses?${params}`, z.array(expenseSchema));
}

export const createExpense = (input: CreateExpenseInput) =>
  apiFetch(`/api/trips/${input.tripId}/expenses`, expenseSchema, { method: "POST", body: input });

export const updateExpense = (id: string, input: CreateExpenseInput) =>
  apiFetch(`/api/trips/${input.tripId}/expenses/${id}`, expenseSchema, {
    method: "PUT",
    body: input,
  });

export const deleteExpense = (tripId: string, id: string) =>
  apiFetch(`/api/trips/${tripId}/expenses/${id}`, deletedExpenseSchema, { method: "DELETE" });
