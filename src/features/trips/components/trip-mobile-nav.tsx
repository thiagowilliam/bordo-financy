"use client";

import { useParams } from "next/navigation";

import { TripTabBar } from "@/components/organisms/trip-tab-bar";
import { useExpenseDrawerStore } from "@/stores/expense-drawer";

import { getTripNavItems } from "../utils/trip-nav";

/** Floating bottom tabs of the trip being viewed. Renders nothing outside /viagens/[tripId]. */
export function TripMobileNav() {
  const { tripId } = useParams<{ tripId?: string }>();
  const openDrawer = useExpenseDrawerStore((state) => state.open);
  if (!tripId) return null;
  return <TripTabBar items={getTripNavItems(tripId)} onLaunch={() => openDrawer("DAILY")} />;
}
