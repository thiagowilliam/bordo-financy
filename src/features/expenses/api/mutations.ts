import { useMutation, useQueryClient } from "@tanstack/react-query";

import { baseCostKeys } from "@/features/base-costs/api/keys";
import { tripKeys } from "@/features/trips/api/keys";

import { createExpense, deleteExpense, updateExpense } from "./client";
import { expenseKeys } from "./keys";
import type { CreateExpenseInput } from "../types";

/** Lists, base costs and the trips list (which shows the amount spent) all depend on expenses. */
function useInvalidateExpenseQueries() {
  const queryClient = useQueryClient();
  return (tripId: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists(tripId) }),
      queryClient.invalidateQueries({ queryKey: baseCostKeys.list(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripKeys.lists() }),
    ]);
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenseQueries();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: (expense) => invalidate(expense.tripId),
  });
}

export function useUpdateExpense() {
  const invalidate = useInvalidateExpenseQueries();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: CreateExpenseInput }) =>
      updateExpense(id, input),
    onSuccess: (expense) => invalidate(expense.tripId),
  });
}

export function useDeleteExpense() {
  const invalidate = useInvalidateExpenseQueries();
  return useMutation({
    mutationFn: ({ tripId, id }: { tripId: string; id: string }) => deleteExpense(tripId, id),
    onSuccess: (_deleted, { tripId }) => invalidate(tripId),
  });
}
