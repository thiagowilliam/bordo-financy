import { CalendarDays, Image as ImageIcon, LayoutDashboard, Wallet } from "lucide-react";
import type { Route } from "next";

type TripNavItem = { href: Route; label: string; icon: React.ReactNode };

/** The four destinations of an open trip, in sidebar and tab bar order. */
export function getTripNavItems(tripId: string): TripNavItem[] {
  const base = `/viagens/${tripId}`;
  return [
    { href: base as Route, label: "Visão geral", icon: <LayoutDashboard /> },
    { href: `${base}/custos-base` as Route, label: "Custos de base", icon: <Wallet /> },
    { href: `${base}/dia-a-dia` as Route, label: "Dia a dia", icon: <CalendarDays /> },
    { href: `${base}/fotos` as Route, label: "Fotos", icon: <ImageIcon /> },
  ];
}
