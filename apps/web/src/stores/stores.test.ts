import { beforeEach, describe, expect, it } from "vitest";

import {
  selectExpenseDrawerEditingId,
  selectExpenseDrawerIsOpen,
  selectExpenseDrawerMode,
  useExpenseDrawerStore,
} from "./expense-drawer";
import { selectSidebarCollapsed, useSidebarStore } from "./sidebar";
import { selectHasUnsavedChanges, useUnsavedChangesStore } from "./unsaved-changes";

describe("expense drawer store", () => {
  beforeEach(() =>
    useExpenseDrawerStore.setState({ isOpen: false, mode: "DAILY", editingId: null }),
  );

  it("opens in the Dia a dia mode by default", () => {
    useExpenseDrawerStore.getState().open();
    const state = useExpenseDrawerStore.getState();
    expect(selectExpenseDrawerIsOpen(state)).toBe(true);
    expect(selectExpenseDrawerMode(state)).toBe("DAILY");
  });

  it("opens in the base cost mode and closes", () => {
    useExpenseDrawerStore.getState().open("BASE");
    expect(selectExpenseDrawerMode(useExpenseDrawerStore.getState())).toBe("BASE");
    useExpenseDrawerStore.getState().close();
    expect(selectExpenseDrawerIsOpen(useExpenseDrawerStore.getState())).toBe(false);
  });

  it("opens to edit an expense and forgets it on close", () => {
    useExpenseDrawerStore.getState().edit("daily-3", "DAILY");
    expect(selectExpenseDrawerEditingId(useExpenseDrawerStore.getState())).toBe("daily-3");
    useExpenseDrawerStore.getState().close();
    expect(selectExpenseDrawerEditingId(useExpenseDrawerStore.getState())).toBeNull();
    useExpenseDrawerStore.getState().edit("daily-3", "DAILY");
    useExpenseDrawerStore.getState().open();
    expect(selectExpenseDrawerEditingId(useExpenseDrawerStore.getState())).toBeNull();
  });
});

describe("sidebar store", () => {
  beforeEach(() => useSidebarStore.setState({ collapsed: false }));

  it("toggles collapsed", () => {
    useSidebarStore.getState().toggle();
    expect(selectSidebarCollapsed(useSidebarStore.getState())).toBe(true);
  });
});

describe("unsaved changes store", () => {
  beforeEach(() => useUnsavedChangesStore.setState({ hasUnsavedChanges: false }));

  it("starts clean and tracks the flag", () => {
    expect(selectHasUnsavedChanges(useUnsavedChangesStore.getState())).toBe(false);
    useUnsavedChangesStore.getState().setHasUnsavedChanges(true);
    expect(selectHasUnsavedChanges(useUnsavedChangesStore.getState())).toBe(true);
  });
});
