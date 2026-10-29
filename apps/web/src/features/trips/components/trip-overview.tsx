"use client";

import { format } from "date-fns";
import { CalendarDays, Pencil, Wallet } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { StatCard } from "@/components/molecules/stat-card";
import { BudgetAdjustPopover } from "@/components/organisms/budget-adjust-popover";
import { BudgetTotalCard } from "@/components/organisms/budget-total-card";
import { CategoryBreakdown } from "@/components/organisms/category-breakdown";
import { LatestExpenses } from "@/components/organisms/latest-expenses";
import { SpendByDayChart } from "@/components/organisms/spend-by-day-chart";
import { TripCover } from "@/components/organisms/trip-cover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBaseCosts } from "@/features/base-costs";
import { useCategories } from "@/features/categories";
import { useExpenses } from "@/features/expenses";
import { ApiError } from "@/lib/api-client";

import type { UpdateTripInput } from "../types";
import { useUpdateTrip } from "../api/mutations";
import { useTrip } from "../api/queries";
import { TripTopBar } from "./trip-top-bar";
import { formatTripPeriod } from "../utils/trip-dates";
import { getTripBadgeLabel, getTripPhase, type TripPhase } from "../utils/trip-status";
import { formatBudgetChangeNote } from "../utils/trip-edit";
import { buildTripOverview, formatExpenseDay } from "../utils/trip-overview";

export type TripOverviewProps = {
  tripId: string;
  /** ISO date (yyyy-MM-dd) used to place the trip in time. Defaults to the current day. */
  today?: string;
};

const phasePrefix: Record<TripPhase, string> = {
  ongoing: "Em andamento",
  upcoming: "Próxima",
  completed: "Concluída",
};

function OverviewSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando visão geral"
      className="flex flex-col gap-6 md:gap-7"
    >
      <Skeleton className="h-62.5 rounded-3xl md:h-75" />
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

/** "Visão geral": cover, budget status, totals, charts and latest expenses of one trip. */
export function TripOverview({ tripId, today }: TripOverviewProps) {
  const todayIso = today ?? format(new Date(), "yyyy-MM-dd");
  const trip = useTrip(tripId);
  const baseCosts = useBaseCosts(tripId);
  const dailyExpenses = useExpenses(tripId);
  const categories = useCategories();
  const updateTrip = useUpdateTrip(tripId);
  const [adjustingBudget, setAdjustingBudget] = useState(false);

  const overview = useMemo(() => {
    if (!trip.data || !baseCosts.data || !dailyExpenses.data || !categories.data) return null;
    return buildTripOverview({
      trip: trip.data,
      baseCosts: baseCosts.data,
      dailyExpenses: dailyExpenses.data,
      categories: categories.data,
      today: todayIso,
    });
  }, [trip.data, baseCosts.data, dailyExpenses.data, categories.data, todayIso]);

  const queries = [trip, baseCosts, dailyExpenses, categories];
  const notFound = trip.error instanceof ApiError && trip.error.status === 404;

  if (notFound) {
    return (
      <div role="alert" className="rounded-xl border border-border bg-card px-6 py-10 text-center">
        <p className="text-base text-foreground">Viagem não encontrada.</p>
      </div>
    );
  }

  if (queries.some((query) => query.isError)) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center"
      >
        <p className="text-base text-foreground">Não foi possível carregar a visão geral.</p>
        <Button
          variant="outline"
          onClick={() => queries.filter((query) => query.isError).forEach((q) => void q.refetch())}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (!trip.data || !categories.data || !overview) return <OverviewSkeleton />;

  const { currency, budgetInCents } = trip.data;
  const percentOfBudget = (amount: number) =>
    budgetInCents > 0 ? Math.round((amount / budgetInCents) * 100) : 0;
  const phase = getTripPhase(trip.data, todayIso);
  const dailyHref = `/viagens/${tripId}/dia-a-dia` as Route;

  return (
    <div className="flex flex-col gap-6 md:gap-7">
      <TripTopBar tripName={trip.data.name} />

      <TripCover
        name={trip.data.name}
        destination={trip.data.destination}
        period={formatTripPeriod(trip.data)}
        phaseLabel={`${phasePrefix[phase]} · ${getTripBadgeLabel(trip.data, todayIso)}`}
        coverPhotoUrl={trip.data.coverPhotoUrl}
        action={
          <Button
            asChild
            variant="secondary"
            className="h-auto gap-2 rounded-lg border-0 bg-white/90 px-3.5 py-2 text-[13px] font-bold text-foreground backdrop-blur-sm hover:bg-white [&_svg:not([class*='size-'])]:size-4"
          >
            <Link href={`/viagens/${tripId}/editar` as Route}>
              <Pencil aria-hidden="true" />
              Editar viagem
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:gap-6">
        <BudgetTotalCard
          spentInCents={overview.spentInCents}
          budgetInCents={budgetInCents}
          currency={currency}
          tripDays={overview.tripDays}
          budgetAction={
            <BudgetAdjustPopover
              budgetInCents={budgetInCents}
              spentInCents={overview.spentInCents}
              currency={currency}
              isPending={updateTrip.isPending}
              open={adjustingBudget}
              onOpenChange={setAdjustingBudget}
              onSave={(next) =>
                updateTrip.mutate(
                  {
                    name: trip.data.name,
                    destination: trip.data.destination,
                    startDate: trip.data.startDate,
                    endDate: trip.data.endDate,
                    currency: trip.data.currency as UpdateTripInput["currency"],
                    budgetInCents: next,
                  },
                  {
                    onSuccess: () => {
                      toast.success("Orçamento atualizado");
                      setAdjustingBudget(false);
                    },
                    onError: () => toast.error("Não foi possível ajustar o orçamento."),
                  },
                )
              }
            />
          }
          budgetNote={
            trip.data.lastBudgetChange
              ? formatBudgetChangeNote(trip.data.lastBudgetChange, currency)
              : undefined
          }
          className="md:flex-1"
        />
        <div className="grid grid-cols-2 gap-3 md:contents">
          <StatCard
            icon={<Wallet />}
            label="Custos de base"
            compactDescription={`${overview.base.count} itens pagos`}
            valueInCents={overview.base.totalInCents}
            currency={currency}
            description={`${overview.base.count} itens · ${percentOfBudget(overview.base.totalInCents)}% do orçamento`}
            className="md:w-60"
          />
          <StatCard
            icon={<CalendarDays />}
            label="Dia a dia"
            compactDescription={`${overview.daily.daysWithExpenses} dias lançados`}
            valueInCents={overview.daily.totalInCents}
            currency={currency}
            description={`${overview.daily.count} lançamentos · ${percentOfBudget(overview.daily.totalInCents)}% do orçamento`}
            className="md:w-60"
          />
        </div>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <SpendByDayChart
          days={overview.days}
          currency={currency}
          averageInCents={overview.averageDailyInCents}
          subtitle={`Dia a dia, de ${formatTripPeriod(trip.data, { showYear: false }).replace(" – ", " a ")}`}
          className="order-2 md:order-1 md:flex-1"
        />
        <CategoryBreakdown
          items={overview.categories}
          currency={currency}
          className="order-1 md:order-2 md:w-105"
        />
      </div>

      <LatestExpenses
        viewAllHref={dailyHref}
        expenses={overview.latest.map((expense) => {
          const category = categories.data.find((item) => item.id === expense.categoryId);
          return {
            id: expense.id,
            href: dailyHref,
            description: expense.description,
            categoryName: category?.name ?? "Sem categoria",
            categoryIcon: category?.icon ?? "tag",
            categoryColor: category?.color ?? 8,
            dateLabel: formatExpenseDay(expense.date, todayIso),
            amountInCents: expense.amountInCents,
            currency: expense.currency,
          };
        })}
      />
    </div>
  );
}
