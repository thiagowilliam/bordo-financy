"use client";

import { format } from "date-fns";
import { useMemo, useState } from "react";

import { DayGroup } from "@/components/organisms/day-group";
import { EmptyState } from "@/components/organisms/empty-state";
import { ExpenseFilterBar } from "@/components/organisms/expense-filter-bar";
import { PeriodSummaryCard } from "@/components/organisms/period-summary-card";
import { ListSummary } from "@/components/molecules/list-summary";
import { PageHeader } from "@/components/molecules/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/features/categories";
import { TripTopBar } from "@/features/trips/components/trip-top-bar";
import { useTrip } from "@/features/trips/api/queries";
import { useExpenseDrawerStore } from "@/stores/expense-drawer";

import { useExpenses } from "../api/queries";
import { useExpenseFilters } from "../hooks/use-expense-filters";
import { useExpenseRowActions } from "../hooks/use-expense-row-actions";
import { getAverageDailyInCents, groupExpensesByDay, summarizePeriod } from "../utils/daily-list";

export type DailyListProps = {
  tripId: string;
  /** ISO date (yyyy-MM-dd) used to flag today. Defaults to the current day. */
  today?: string;
};

const DAYS_PER_PAGE = 3;

function ListSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando lançamentos"
      className="flex flex-col gap-6"
    >
      {[0, 1, 2].map((index) => (
        <Skeleton key={index} className="h-48 rounded-2xl" />
      ))}
    </div>
  );
}

/** "Dia a dia": daily expenses of a trip grouped by day, with URL-driven filters and a summary. */
export function DailyList({ tripId, today }: DailyListProps) {
  const todayIso = today ?? format(new Date(), "yyyy-MM-dd");
  const trip = useTrip(tripId);
  const categories = useCategories();
  const openDrawer = useExpenseDrawerStore((state) => state.open);
  const [visibleDays, setVisibleDays] = useState(DAYS_PER_PAGE);
  const rowActions = useExpenseRowActions(tripId, "DAILY");

  const tripDates = useMemo(
    () => ({
      startDate: trip.data?.startDate ?? todayIso,
      endDate: trip.data?.endDate ?? todayIso,
    }),
    [trip.data?.startDate, trip.data?.endDate, todayIso],
  );
  const filters = useExpenseFilters({ today: todayIso, trip: tripDates });
  const all = useExpenses(tripId);
  const filtered = useExpenses(tripId, filters.apiFilters);

  const currency = trip.data?.currency ?? "EUR";

  const averageDailyInCents = useMemo(
    () => (all.data ? getAverageDailyInCents(all.data, tripDates, todayIso) : 0),
    [all.data, tripDates, todayIso],
  );
  const groups = useMemo(
    () =>
      filtered.data
        ? groupExpensesByDay({
            expenses: filtered.data,
            tripStartDate: tripDates.startDate,
            today: todayIso,
            averageDailyInCents,
          })
        : [],
    [filtered.data, tripDates.startDate, todayIso, averageDailyInCents],
  );
  const summary = useMemo(
    () => summarizePeriod(filtered.data ?? [], categories.data ?? []),
    [filtered.data, categories.data],
  );
  const categoryOptions = useMemo(() => {
    const counts = Map.groupBy(all.data ?? [], (expense) => expense.categoryId);
    return (categories.data ?? [])
      .filter((category) => counts.has(category.id))
      .map((category) => ({
        id: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        count: counts.get(category.id)!.length,
      }));
  }, [all.data, categories.data]);
  const categoriesById = useMemo(
    () => new Map((categories.data ?? []).map((category) => [category.id, category])),
    [categories.data],
  );

  const queries = [trip, categories, all, filtered];
  if (queries.some((query) => query.isError)) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center"
      >
        <p className="text-base text-foreground">Não foi possível carregar os lançamentos.</p>
        <Button
          variant="outline"
          onClick={() => queries.filter((query) => query.isError).forEach((q) => void q.refetch())}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  const isLoading = !trip.data || !categories.data || !all.data;
  const hasNoExpenses = all.data?.length === 0;
  const visibleGroups = groups.slice(0, visibleDays);
  const hiddenDays = groups.length - visibleGroups.length;

  return (
    <div className="flex flex-col gap-5 md:gap-7">
      <TripTopBar tripName={trip.data?.name ?? ""} />

      <PageHeader
        title="Dia a dia"
        eyebrow={trip.data?.name}
        eyebrowClassName="md:hidden"
        subtitle="Tudo o que você gastou durante a viagem, dia por dia."
        subtitleClassName="hidden md:block"
      />

      {isLoading ? <ListSkeleton /> : null}

      {!isLoading && hasNoExpenses ? (
        <EmptyState
          title="Nenhum gasto lançado ainda"
          description="Registre cada gasto da viagem e acompanhe o dia a dia contra o orçamento."
          className="md:min-h-0"
          action={
            <Button
              variant="cta"
              onClick={() => openDrawer("DAILY")}
              className="h-auto rounded-lg px-6 py-3.5 text-base font-bold"
            >
              Lançar primeiro gasto
            </Button>
          }
        />
      ) : null}

      {!isLoading && !hasNoExpenses ? (
        <>
          <ExpenseFilterBar
            search={filters.search}
            onSearchChange={filters.setSearch}
            categoryOptions={categoryOptions}
            categories={filters.categories}
            onCategoriesChange={filters.setCategories}
            period={filters.period}
            onPeriodChange={filters.setPeriod}
            periodBounds={{ min: tripDates.startDate, max: tripDates.endDate }}
            paymentMethod={filters.paymentMethod}
            onPaymentMethodChange={filters.setPaymentMethod}
            result={
              filters.hasActiveFilters && filtered.data
                ? { count: summary.entryCount, totalInCents: summary.totalInCents, currency }
                : undefined
            }
            onClear={filters.clear}
          />

          <ListSummary
            className="lg:hidden"
            count={summary.entryCount}
            dayCount={filters.hasActiveFilters ? undefined : summary.dayCount}
            totalInCents={summary.totalInCents}
            currency={currency}
          />

          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-5 md:gap-5.5">
              {filtered.isPending ? <ListSkeleton /> : null}

              {filtered.data && groups.length === 0 ? (
                <div
                  role="status"
                  className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-10 text-center"
                >
                  <p className="text-base font-semibold text-foreground">
                    Nenhum lançamento encontrado
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ajuste a busca ou os filtros para ver outros gastos.
                  </p>
                  <Button variant="outline" onClick={filters.clear}>
                    Limpar filtros
                  </Button>
                </div>
              ) : null}

              {visibleGroups.map((group) => (
                <DayGroup
                  key={group.date}
                  label={group.label}
                  isToday={group.isToday}
                  trend={group.trend}
                  totalInCents={group.totalInCents}
                  currency={currency}
                  renderActions={rowActions.actions}
                  entries={group.expenses.map((expense) => {
                    const category = categoriesById.get(expense.categoryId);
                    return {
                      id: expense.id,
                      onSelect: rowActions.select(expense.id),
                      description: expense.description,
                      categoryName: category?.name ?? "Sem categoria",
                      categoryIcon: category?.icon ?? "tag",
                      categoryColor: category?.color ?? 8,
                      paymentMethod: expense.paymentMethod,
                      amountInCents: expense.amountInCents,
                      currency: expense.currency,
                    };
                  })}
                />
              ))}

              {hiddenDays > 0 ? (
                <Button
                  variant="outline"
                  className="h-auto w-full rounded-lg bg-card py-3.5 text-base font-bold"
                  onClick={() => setVisibleDays((count) => count + DAYS_PER_PAGE)}
                >
                  Ver dias anteriores
                </Button>
              ) : null}
            </div>

            <div className="hidden w-77 shrink-0 lg:block">
              <PeriodSummaryCard
                totalInCents={summary.totalInCents}
                entryCount={summary.entryCount}
                averageInCents={summary.averageInCents}
                dayCount={summary.dayCount}
                currency={currency}
                categories={summary.categories}
                filtered={filters.hasActiveFilters}
              />
            </div>
          </div>
        </>
      ) : null}
      {rowActions.confirmDialog}
    </div>
  );
}
