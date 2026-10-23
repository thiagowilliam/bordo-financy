import type { ExpenseFilters } from "../types";

export const expenseKeys = {
  all: ["expenses"] as const,
  lists: (tripId: string) => [...expenseKeys.all, "list", tripId] as const,
  list: (tripId: string, filters: ExpenseFilters) =>
    [...expenseKeys.lists(tripId), filters] as const,
};
