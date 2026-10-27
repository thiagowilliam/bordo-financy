import { create } from "zustand";
import { persist } from "zustand/middleware";

type SidebarState = {
  collapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
};

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    { name: "bordo:sidebar", partialize: ({ collapsed }) => ({ collapsed }), skipHydration: true },
  ),
);

export const selectSidebarCollapsed = (state: SidebarState) => state.collapsed;
export const selectSidebarToggle = (state: SidebarState) => state.toggle;
