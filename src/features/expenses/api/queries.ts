import { queryOptions, useQuery } from "@tanstack/react-query";

import type { ExpenseFilters } from "../types";
import { fetchExpenses } from "./client";
import { expenseKeys } from "./keys";

export const expensesQueryOptions = (tripId: string, filters: ExpenseFilters = {}) =>
  queryOptions({
    queryKey: expenseKeys.list(tripId, filters),
    queryFn: () => fetchExpenses(tripId, filters),
  });

export const useExpenses = (tripId: string, filters: ExpenseFilters = {}) =>
  useQuery(expensesQueryOptions(tripId, filters));
