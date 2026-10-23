import { create } from "zustand";

import type { ExpenseKind } from "@/features/expenses";

type ExpenseDrawerState = {
  isOpen: boolean;
  mode: ExpenseKind;
  open: (mode?: ExpenseKind) => void;
  close: () => void;
  setMode: (mode: ExpenseKind) => void;
};

export const useExpenseDrawerStore = create<ExpenseDrawerState>()((set) => ({
  isOpen: false,
  mode: "DAILY",
  open: (mode = "DAILY") => set({ isOpen: true, mode }),
  close: () => set({ isOpen: false }),
  setMode: (mode) => set({ mode }),
}));

export const selectExpenseDrawerIsOpen = (state: ExpenseDrawerState) => state.isOpen;
export const selectExpenseDrawerMode = (state: ExpenseDrawerState) => state.mode;
export const selectExpenseDrawerActions = (state: ExpenseDrawerState) => ({
  open: state.open,
  close: state.close,
  setMode: state.setMode,
});
