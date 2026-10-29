"use client";

import { ChevronLeft } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Breadcrumb } from "@/components/molecules/breadcrumb";
import { PageHeader } from "@/components/molecules/page-header";
import { Button } from "@/components/ui/button";

import { useTrip } from "../api/queries";
import { EditTripForm } from "./edit-trip-form";

export type EditTripPageProps = {
  tripId: string;
};

/** "Editar viagem": breadcrumb with the trip name, header and the form. */
export function EditTripPage({ tripId }: EditTripPageProps) {
  const trip = useTrip(tripId);
  const tripHref = `/viagens/${tripId}` as Route;

  return (
    <div className="flex flex-col gap-4 md:gap-7">
      <Breadcrumb
        className="max-md:hidden"
        items={[
          { label: "Minhas viagens", href: "/viagens" },
          { label: trip.data?.name ?? "Viagem", href: tripHref },
          { label: "Editar" },
        ]}
      />
      <div className="flex flex-col gap-4 md:gap-6">
        <Button
          asChild
          variant="outline"
          size="icon"
          className="size-10 rounded-full bg-card md:hidden"
        >
          <Link href={tripHref} aria-label="Voltar">
            <ChevronLeft aria-hidden="true" className="size-5" />
          </Link>
        </Button>
        <PageHeader
          title="Editar viagem"
          eyebrow={trip.data?.name}
          eyebrowClassName="md:hidden"
          subtitle="Ajuste datas, orçamento e capa. Seus gastos continuam salvos."
          subtitleClassName="max-md:hidden"
        />
        <EditTripForm tripId={tripId} />
      </div>
    </div>
  );
}
