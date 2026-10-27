import { useMutation, useQueryClient } from "@tanstack/react-query";

import { baseCostKeys } from "@/features/base-costs/api/keys";
import { expenseKeys } from "@/features/expenses/api/keys";

import { createCategory, deleteCategory, setCategoryHidden, updateCategory } from "./client";
import { categoryKeys } from "./keys";
import type { UpdateCategoryInput } from "../types";

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCategoryInput }) =>
      updateCategory(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

export function useSetCategoryHidden() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, hidden }: { id: string; hidden: boolean }) => setCategoryHidden(id, hidden),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
  });
}

/** Moving expenses changes every expense list, so those are refreshed too. */
export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, moveTo }: { id: string; moveTo?: string }) => deleteCategory(id, moveTo),
    onSuccess: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: categoryKeys.all }),
        queryClient.invalidateQueries({ queryKey: expenseKeys.all }),
        queryClient.invalidateQueries({ queryKey: baseCostKeys.all }),
      ]),
  });
}
