"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { RowActionButton } from "@/components/molecules/row-action-button";
import { ConfirmDialog } from "@/components/organisms/confirm-dialog";
import { useExpenseDrawerStore } from "@/stores/expense-drawer";

import { useDeleteExpense } from "../api/mutations";
import type { ExpenseKind } from "../types";

/**
 * Edit and delete behaviour shared by the expense lists: clicking a row opens the drawer in edit
 * mode, the hover buttons edit or ask to delete, and `confirmDialog` must be rendered once.
 */
export function useExpenseRowActions(tripId: string, kind: ExpenseKind) {
  const edit = useExpenseDrawerStore((state) => state.edit);
  const deleteExpense = useDeleteExpense();
  const [pendingId, setPendingId] = useState<string | null>(null);

  function confirmDelete() {
    if (!pendingId) return;
    deleteExpense.mutate(
      { tripId, id: pendingId },
      {
        onSuccess: () => {
          toast.success("Lançamento excluído");
          setPendingId(null);
        },
        onError: () => toast.error("Não foi possível excluir. Tente de novo."),
      },
    );
  }

  return {
    select: (id: string) => () => edit(id, kind),
    actions: (id: string) => (
      <>
        <RowActionButton
          icon={<Pencil />}
          label="Editar lançamento"
          onClick={() => edit(id, kind)}
        />
        <RowActionButton
          tone="destructive"
          icon={<Trash2 />}
          label="Excluir lançamento"
          onClick={() => setPendingId(id)}
        />
      </>
    ),
    confirmDialog: (
      <ConfirmDialog
        open={pendingId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingId(null);
        }}
        title="Excluir lançamento?"
        description="Essa ação não pode ser desfeita. O valor sai dos totais da viagem."
        onConfirm={confirmDelete}
        isPending={deleteExpense.isPending}
      />
    ),
  };
}
