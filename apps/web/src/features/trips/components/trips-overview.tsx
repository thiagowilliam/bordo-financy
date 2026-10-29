"use client";

import { format } from "date-fns";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PageHeader } from "@/components/molecules/page-header";
import { TripCard } from "@/components/molecules/trip-card";
import { EmptyState } from "@/components/organisms/empty-state";
import { TripActionsMenu } from "@/components/organisms/trip-actions-menu";
import { TripSection } from "@/components/organisms/trip-section";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { useProfile } from "@/features/profile";

import { useTrips } from "../api/queries";
import type { TripSummary } from "../types";
import { useTripDeleteFlow } from "./trip-delete-flow";
import { formatTripPeriod } from "../utils/trip-dates";
import { getTripBadgeLabel, getTripPhase, type TripPhase } from "../utils/trip-status";

export type TripsOverviewProps = {
  /** ISO date (yyyy-MM-dd) used to classify trips. Defaults to the current day. */
  today?: string;
};

const sections: { phase: TripPhase; title: string }[] = [
  { phase: "ongoing", title: "Em andamento" },
  { phase: "upcoming", title: "Próximas" },
  { phase: "completed", title: "Concluídas" },
];

const sorters: Record<TripPhase, (a: TripSummary, b: TripSummary) => number> = {
  ongoing: (a, b) => a.startDate.localeCompare(b.startDate),
  upcoming: (a, b) => a.startDate.localeCompare(b.startDate),
  completed: (a, b) => b.endDate.localeCompare(a.endDate),
};

function NewTripAction() {
  return (
    <Button
      asChild
      variant="cta"
      className="h-auto gap-2 rounded-lg p-2.75 text-base font-bold md:px-6 md:py-3.5 [&_svg:not([class*='size-'])]:size-4.5"
    >
      <Link href="/viagens/nova">
        <Plus aria-hidden="true" />
        <span className="max-md:sr-only">Nova viagem</span>
      </Link>
    </Button>
  );
}

function CardsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Carregando viagens"
      role="status"
      className="grid grid-cols-1 gap-6.5 md:grid-cols-[repeat(auto-fill,minmax(340px,1fr))]"
    >
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-100 rounded-xl" />
      ))}
    </div>
  );
}

/** "Minhas viagens": trips grouped by phase, with loading, error and empty states. */
export function TripsOverview({ today }: TripsOverviewProps) {
  const router = useRouter();
  const { data: profile } = useProfile();
  const firstName = profile?.name.trim().split(/\s+/)[0];
  const greeting = firstName ? `Olá, ${firstName}` : "Olá";
  const { data: trips, isPending, isError, refetch } = useTrips();
  const { requestDelete, dialog } = useTripDeleteFlow();
  const todayIso = today ?? format(new Date(), "yyyy-MM-dd");
  const isEmpty = trips?.length === 0;

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      <PageHeader
        title="Minhas viagens"
        eyebrow={greeting}
        eyebrowClassName="md:hidden"
        subtitle={
          isEmpty
            ? `${greeting}. Suas viagens vão aparecer aqui.`
            : `${greeting}. Do planejamento à volta, tudo num só lugar.`
        }
        subtitleClassName="hidden md:block"
        action={isEmpty ? undefined : <NewTripAction />}
      />

      {isPending ? <CardsSkeleton /> : null}

      {isError ? (
        <div
          role="alert"
          className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center"
        >
          <p className="text-base text-foreground">Não foi possível carregar suas viagens.</p>
          <Button variant="outline" onClick={() => void refetch()}>
            Tentar de novo
          </Button>
        </div>
      ) : null}

      {isEmpty ? <TripsEmptyState /> : null}

      {dialog}

      {trips && trips.length > 0 ? (
        <div className="flex flex-col gap-6 md:gap-8">
          {sections.map(({ phase, title }) => {
            const group = trips
              .filter((trip) => getTripPhase(trip, todayIso) === phase)
              .toSorted(sorters[phase]);
            if (group.length === 0) return null;
            return (
              <TripSection key={phase} title={title} count={group.length}>
                {group.map((trip) => (
                  <TripCard
                    key={trip.id}
                    href={`/viagens/${trip.id}`}
                    name={trip.name}
                    destination={trip.destination}
                    period={formatTripPeriod(trip, { showYear: phase !== "ongoing" })}
                    badgeLabel={getTripBadgeLabel(trip, todayIso)}
                    coverPhotoUrl={trip.coverPhotoUrl}
                    spentInCents={trip.spentInCents}
                    budgetInCents={trip.budgetInCents}
                    currency={trip.currency}
                    menu={
                      <TripActionsMenu
                        onEdit={() => router.push(`/viagens/${trip.id}/editar`)}
                        onDelete={() =>
                          requestDelete({ id: trip.id, name: trip.name, currency: trip.currency })
                        }
                      />
                    }
                  />
                ))}
              </TripSection>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

function TripsEmptyState() {
  return (
    <EmptyState
      title="Sua primeira viagem começa aqui"
      description={
        <>
          <span className="md:hidden">
            Cadastre o destino, registre os custos de base e acompanhe cada gasto. Leva menos de um
            minuto.
          </span>
          <span className="hidden md:inline">
            Cadastre o destino, registre os custos de base e acompanhe cada gasto sem sair do
            orçamento. Leva menos de um minuto.
          </span>
        </>
      }
      illustration={
        <Image
          src="/illustrations/empty-trips.png"
          alt=""
          width={400}
          height={300}
          priority
          className="h-auto w-65 md:w-100"
        />
      }
      action={
        <Button
          asChild
          variant="cta"
          className="h-auto w-full gap-2 rounded-lg px-5.5 py-4 text-base font-bold md:w-auto md:px-7 md:py-[15px] [&_svg:not([class*='size-'])]:size-4.5"
        >
          <Link href="/viagens/nova">
            <Plus aria-hidden="true" />
            Criar primeira viagem
          </Link>
        </Button>
      }
    />
  );
}
