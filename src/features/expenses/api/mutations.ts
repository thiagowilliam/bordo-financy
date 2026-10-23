import { useMutation, useQueryClient } from "@tanstack/react-query";

import { baseCostKeys } from "@/features/base-costs/api/keys";

import { createExpense } from "./client";
import { expenseKeys } from "./keys";

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: (expense) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: expenseKeys.lists(expense.tripId) }),
        queryClient.invalidateQueries({ queryKey: baseCostKeys.list(expense.tripId) }),
      ]),
  });
}
