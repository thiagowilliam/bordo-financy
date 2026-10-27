"use client";

import { Plus } from "lucide-react";

import { Breadcrumb } from "@/components/molecules/breadcrumb";
import { Button } from "@/components/ui/button";
import { useExpenseDrawerStore } from "@/stores/expense-drawer";

export type TripTopBarProps = {
  tripName: string;
};

/** Desktop bar of the trip screens: breadcrumb on the left, "Lançar gasto" on the right. */
export function TripTopBar({ tripName }: TripTopBarProps) {
  const openDrawer = useExpenseDrawerStore((state) => state.open);
  return (
    <div className="hidden items-center justify-between md:flex">
      <Breadcrumb items={[{ label: "Minhas viagens", href: "/viagens" }, { label: tripName }]} />
      <Button
        variant="cta"
        onClick={() => openDrawer("DAILY")}
        className="h-auto gap-2 rounded-lg px-5.5 py-3.25 text-base font-bold [&_svg:not([class*='size-'])]:size-4.5"
      >
        <Plus aria-hidden="true" />
        Lançar gasto
      </Button>
    </div>
  );
}
