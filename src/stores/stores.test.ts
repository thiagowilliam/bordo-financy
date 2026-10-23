import { beforeEach, describe, expect, it } from "vitest";

import {
  selectExpenseDrawerIsOpen,
  selectExpenseDrawerMode,
  useExpenseDrawerStore,
} from "./expense-drawer";
import { selectSidebarCollapsed, useSidebarStore } from "./sidebar";

describe("expense drawer store", () => {
  beforeEach(() => useExpenseDrawerStore.setState({ isOpen: false, mode: "DAILY" }));

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
});

describe("sidebar store", () => {
  beforeEach(() => useSidebarStore.setState({ collapsed: false }));

  it("toggles collapsed", () => {
    useSidebarStore.getState().toggle();
    expect(selectSidebarCollapsed(useSidebarStore.getState())).toBe(true);
  });
});
