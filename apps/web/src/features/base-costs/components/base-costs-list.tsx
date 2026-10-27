"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";

import { PageHeader } from "@/components/molecules/page-header";
import { BaseCostsSummary } from "@/components/organisms/base-costs-summary";
import { CostGroup } from "@/components/organisms/cost-group";
import { CostTypeBreakdown } from "@/components/organisms/cost-type-breakdown";
import { EmptyState } from "@/components/organisms/empty-state";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories } from "@/features/categories";
import { useTrip } from "@/features/trips/api/queries";
import { TripTopBar } from "@/features/trips/components/trip-top-bar";
import { useExpenseRowActions } from "@/features/expenses/hooks/use-expense-row-actions";
import { useExpenseDrawerStore } from "@/stores/expense-drawer";

import { useBaseCosts } from "../api/queries";
import { formatPaidOn, formatShareLabel, groupBaseCosts } from "../utils/group-base-costs";

export type BaseCostsListProps = {
  tripId: string;
};

function AddBaseCostButton({ className }: { className?: string }) {
  const openDrawer = useExpenseDrawerStore((state) => state.open);
  return (
    <Button
      onClick={() => openDrawer("BASE")}
      className={`h-auto gap-2 rounded-lg px-5.5 py-3.25 text-base font-bold [&_svg:not([class*='size-'])]:size-4.5 ${className ?? ""}`}
    >
      <Plus aria-hidden="true" />
      Adicionar custo
    </Button>
  );
}

function ListSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando custos de base"
      className="flex flex-col gap-5"
    >
      <Skeleton className="h-32 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
      <Skeleton className="h-56 rounded-2xl" />
    </div>
  );
}

/** "Custos de base": what is paid before and outside the day to day, grouped by cost type. */
export function BaseCostsList({ tripId }: BaseCostsListProps) {
  const trip = useTrip(tripId);
  const baseCosts = useBaseCosts(tripId);
  const categories = useCategories();
  const rowActions = useExpenseRowActions(tripId, "BASE");

  const overview = useMemo(
    () =>
      baseCosts.data && categories.data ? groupBaseCosts(baseCosts.data, categories.data) : null,
    [baseCosts.data, categories.data],
  );

  const queries = [trip, baseCosts, categories];
  if (queries.some((query) => query.isError)) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center"
      >
        <p className="text-base text-foreground">Não foi possível carregar os custos de base.</p>
        <Button
          variant="outline"
          onClick={() => queries.filter((query) => query.isError).forEach((q) => void q.refetch())}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  const isEmpty = overview?.itemCount === 0;

  return (
    <div className="flex flex-col gap-6 md:gap-7">
      <TripTopBar tripName={trip.data?.name ?? ""} />

      <PageHeader
        title="Custos de base"
        eyebrow={trip.data?.name}
        eyebrowClassName="md:hidden"
        subtitle="O que você paga antes e fora do dia a dia da viagem."
        subtitleClassName="hidden md:block"
        action={isEmpty || !overview ? undefined : <AddBaseCostButton className="max-md:hidden" />}
      />

      {!trip.data || !overview ? <ListSkeleton /> : null}

      {trip.data && isEmpty ? (
        <EmptyState
          title="Nenhum custo de base ainda"
          description="Cadastre passagens, hospedagem, aluguel de carro e seguro para ver quanto do orçamento já está comprometido."
          className="md:min-h-0"
          action={<AddBaseCostButton />}
        />
      ) : null}

      {trip.data && overview && !isEmpty ? (
        <>
          <BaseCostsSummary
            totalInCents={overview.totalInCents}
            budgetInCents={trip.data.budgetInCents}
            currency={trip.data.currency}
            itemCount={overview.itemCount}
            typeCount={overview.groups.length}
            action={<AddBaseCostButton className="w-full" />}
          />

          <div className="flex flex-col gap-6 lg:flex-row">
            <CostTypeBreakdown
              className="lg:order-2 lg:w-85 lg:shrink-0 lg:self-start"
              currency={trip.data.currency}
              items={overview.groups.map((group) => ({
                id: group.categoryId,
                name: group.name,
                color: group.color,
                amountInCents: group.subtotalInCents,
              }))}
            />

            <div className="flex min-w-0 flex-1 flex-col gap-6 lg:order-1 lg:gap-5.5">
              {overview.groups.map((group) => (
                <CostGroup
                  key={group.categoryId}
                  name={group.name}
                  icon={group.icon}
                  color={group.color}
                  shareLabel={formatShareLabel(group.sharePercent)}
                  subtotalInCents={group.subtotalInCents}
                  currency={trip.data.currency}
                  items={group.items.map((item) => ({
                    id: item.id,
                    onSelect: rowActions.select(item.id),
                    actions: rowActions.actions(item.id),
                    description: item.description,
                    paidOnLabel: formatPaidOn(item.date),
                    amountInCents: item.amountInCents,
                    currency: item.currency,
                  }))}
                />
              ))}
            </div>
          </div>
        </>
      ) : null}
      {rowActions.confirmDialog}
    </div>
  );
}
