import { create } from "zustand";

import type { ExpenseKind } from "@/features/expenses";

type ExpenseDrawerState = {
  isOpen: boolean;
  mode: ExpenseKind;
  /** Id of the expense being edited; `null` when launching a new one. The data comes from queries. */
  editingId: string | null;
  open: (mode?: ExpenseKind) => void;
  edit: (expenseId: string, mode: ExpenseKind) => void;
  close: () => void;
  setMode: (mode: ExpenseKind) => void;
};

export const useExpenseDrawerStore = create<ExpenseDrawerState>()((set) => ({
  isOpen: false,
  mode: "DAILY",
  editingId: null,
  open: (mode = "DAILY") => set({ isOpen: true, mode, editingId: null }),
  edit: (expenseId, mode) => set({ isOpen: true, mode, editingId: expenseId }),
  close: () => set({ isOpen: false, editingId: null }),
  setMode: (mode) => set({ mode }),
}));

export const selectExpenseDrawerIsOpen = (state: ExpenseDrawerState) => state.isOpen;
export const selectExpenseDrawerMode = (state: ExpenseDrawerState) => state.mode;
export const selectExpenseDrawerEditingId = (state: ExpenseDrawerState) => state.editingId;
export const selectExpenseDrawerActions = (state: ExpenseDrawerState) => ({
  open: state.open,
  edit: state.edit,
  close: state.close,
  setMode: state.setMode,
});
