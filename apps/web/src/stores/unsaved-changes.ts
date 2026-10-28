import { create } from "zustand";

type UnsavedChangesState = {
  /** A form on screen has edits that were not saved. Leaving the account (sign out) must confirm. */
  hasUnsavedChanges: boolean;
  setHasUnsavedChanges: (hasUnsavedChanges: boolean) => void;
};

export const useUnsavedChangesStore = create<UnsavedChangesState>()((set) => ({
  hasUnsavedChanges: false,
  setHasUnsavedChanges: (hasUnsavedChanges) => set({ hasUnsavedChanges }),
}));

export const selectHasUnsavedChanges = (state: UnsavedChangesState) => state.hasUnsavedChanges;
export const selectSetHasUnsavedChanges = (state: UnsavedChangesState) =>
  state.setHasUnsavedChanges;
