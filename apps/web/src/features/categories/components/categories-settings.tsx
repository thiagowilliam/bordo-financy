"use client";

import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { SegmentedControl } from "@/components/molecules/segmented-control";
import { SettingsNote } from "@/components/molecules/settings-note";
import {
  CategoryFormDialog,
  type CategoryFormValues,
} from "@/components/organisms/category-form-dialog";
import { CategoryList } from "@/components/organisms/category-list";
import { DeleteCategoryDialog } from "@/components/organisms/delete-category-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { baseCostsQueryOptions } from "@/features/base-costs/api/queries";
import { expensesQueryOptions } from "@/features/expenses/api/queries";
import { useTrips } from "@/features/trips/api/queries";
import { getTripPhase } from "@/features/trips/utils/trip-status";

import {
  useCreateCategory,
  useDeleteCategory,
  useSetCategoryHidden,
  useUpdateCategory,
} from "../api/mutations";
import { useCategories } from "../api/queries";
import type { Category, CategoryKind } from "../types";
import { emptyUsage, getCategoryUsage } from "../utils/category-usage";

export type CategoriesSettingsProps = {
  /** ISO date (yyyy-MM-dd) used to pick the reference trip. Defaults to the current day. */
  today?: string;
};

const kindOptions: { value: CategoryKind; label: string }[] = [
  { value: "DAILY", label: "Dia a dia" },
  { value: "BASE", label: "Custos de base" },
];

const kindLabel: Record<CategoryKind, string> = { DAILY: "Dia a dia", BASE: "Custo de base" };

const countLabel = (count: number) => `${count} ${count === 1 ? "lançamento" : "lançamentos"}`;

function ListSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Carregando categorias"
      className="flex flex-col gap-3"
    >
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-16 rounded-2xl" />
      <Skeleton className="h-16 rounded-2xl" />
    </div>
  );
}

type Dialog =
  | { type: "create" }
  | { type: "edit"; category: Category }
  | { type: "delete"; category: Category }
  | null;

/**
 * "Configurações > Categorias". Counts and totals refer to the trip being lived (or the most
 * recent one), since categories are global but amounts live in each trip's currency.
 */
export function CategoriesSettings({ today }: CategoriesSettingsProps) {
  const todayIso = today ?? format(new Date(), "yyyy-MM-dd");
  const categories = useCategories();
  const trips = useTrips();
  const [kind, setKind] = useState<CategoryKind>("DAILY");
  const [dialog, setDialog] = useState<Dialog>(null);

  const referenceTrip = useMemo(() => {
    const list = trips.data ?? [];
    return (
      list.find((trip) => getTripPhase(trip, todayIso) === "ongoing") ??
      list.toSorted((a, b) => b.startDate.localeCompare(a.startDate))[0]
    );
  }, [trips.data, todayIso]);
  const referenceTripId = referenceTrip?.id ?? "";
  const dailyExpenses = useQuery({
    ...expensesQueryOptions(referenceTripId),
    enabled: Boolean(referenceTripId),
  });
  const baseCosts = useQuery({
    ...baseCostsQueryOptions(referenceTripId),
    enabled: Boolean(referenceTripId),
  });

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const setHidden = useSetCategoryHidden();
  const deleteCategory = useDeleteCategory();

  const usage = useMemo(
    () => getCategoryUsage([...(dailyExpenses.data ?? []), ...(baseCosts.data ?? [])]),
    [dailyExpenses.data, baseCosts.data],
  );

  const currency = referenceTrip?.currency ?? "BRL";
  const visible = (categories.data ?? []).filter((category) => category.kind === kind);

  if (categories.isError || trips.isError) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center"
      >
        <p className="text-base text-foreground">Não foi possível carregar as categorias.</p>
        <Button
          variant="outline"
          onClick={() => {
            if (categories.isError) void categories.refetch();
            if (trips.isError) void trips.refetch();
          }}
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  function handleSubmit(values: CategoryFormValues) {
    if (dialog?.type === "create") {
      createCategory.mutate(
        { ...values, kind },
        {
          onSuccess: () => {
            toast.success("Categoria criada");
            setDialog(null);
          },
          onError: () => toast.error("Não foi possível criar a categoria. Tente de novo."),
        },
      );
    } else if (dialog?.type === "edit") {
      updateCategory.mutate(
        { id: dialog.category.id, input: values },
        {
          onSuccess: () => {
            toast.success("Categoria atualizada");
            setDialog(null);
          },
          onError: () => toast.error("Não foi possível salvar a categoria. Tente de novo."),
        },
      );
    }
  }

  function handleToggleHidden(category: Category) {
    setHidden.mutate(
      { id: category.id, hidden: !category.hidden },
      {
        onSuccess: () =>
          toast.success(category.hidden ? "Categoria visível de novo" : "Categoria ocultada"),
        onError: () => toast.error("Não foi possível atualizar a categoria. Tente de novo."),
      },
    );
  }

  function handleDelete(moveToId?: string) {
    if (dialog?.type !== "delete") return;
    deleteCategory.mutate(
      { id: dialog.category.id, moveTo: moveToId },
      {
        onSuccess: () => {
          toast.success("Categoria excluída");
          setDialog(null);
        },
        onError: () =>
          toast.error(
            "Não foi possível excluir. Se outras viagens usam a categoria, oculte-a ou escolha para onde mover os lançamentos.",
          ),
      },
    );
  }

  const editing = dialog?.type === "edit" ? dialog.category : null;
  const deleting = dialog?.type === "delete" ? dialog.category : null;
  const deletingUsage = (deleting && usage.get(deleting.id)) || emptyUsage;
  const formOpen = dialog?.type === "create" || dialog?.type === "edit";
  const editingUsage = (editing && usage.get(editing.id)) || emptyUsage;

  return (
    <section aria-labelledby="categories-title" className="flex min-w-0 flex-1 flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2
            id="categories-title"
            className="text-xl font-bold tracking-[-0.3px] text-foreground md:text-2xl md:tracking-[-0.4px]"
          >
            Categorias
          </h2>
          <p className="hidden text-sm text-muted-foreground md:block">
            Como seus lançamentos são classificados nos relatórios.
          </p>
        </div>
        <Button
          onClick={() => setDialog({ type: "create" })}
          className="h-auto gap-2 rounded-lg px-3.5 py-2.5 text-sm font-bold md:px-5.5 md:py-3.25 md:text-base [&_svg:not([class*='size-'])]:size-4 md:[&_svg:not([class*='size-'])]:size-4.5"
        >
          <Plus aria-hidden="true" />
          Nova categoria
        </Button>
      </div>

      <SegmentedControl
        aria-label="Tipo de lançamento"
        options={kindOptions}
        value={kind}
        onValueChange={(value) => setKind(value as CategoryKind)}
        className="md:w-85"
      />

      {!categories.data ? (
        <ListSkeleton />
      ) : (
        <CategoryList
          items={visible.map((category) => {
            const used = usage.get(category.id) ?? emptyUsage;
            return {
              id: category.id,
              name: category.name,
              icon: category.icon,
              color: category.color,
              isDefault: category.isDefault,
              hidden: category.hidden,
              usageCount: used.count,
              totalInCents: used.totalInCents,
              currency,
              onEdit: () => setDialog({ type: "edit", category }),
              onToggleHidden: () => handleToggleHidden(category),
              onDelete: () => setDialog({ type: "delete", category }),
            };
          })}
        />
      )}

      <SettingsNote>
        Categorias padrão não podem ser excluídas, apenas ocultadas.
        <span className="max-md:hidden"> Lançamentos antigos mantêm a categoria original.</span>
        {referenceTrip ? ` Quantidades e valores se referem à viagem ${referenceTrip.name}.` : ""}
      </SettingsNote>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        mode={editing ? "edit" : "create"}
        initialValues={
          editing ? { name: editing.name, icon: editing.icon, color: editing.color } : undefined
        }
        previewSubtitle={
          editing
            ? `${countLabel(editingUsage.count)} · ${kindLabel[editing.kind]}`
            : `Nova categoria · ${kindLabel[kind]}`
        }
        onSubmit={handleSubmit}
        isPending={createCategory.isPending || updateCategory.isPending}
      />

      <DeleteCategoryDialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDialog(null);
        }}
        name={deleting?.name ?? ""}
        usageCount={deletingUsage.count}
        totalInCents={deletingUsage.totalInCents}
        currency={currency}
        targets={(categories.data ?? [])
          .filter(
            (category) =>
              deleting &&
              category.id !== deleting.id &&
              category.kind === deleting.kind &&
              !category.hidden,
          )
          .map(({ id, name, icon, color }) => ({ id, name, icon, color }))}
        onConfirm={handleDelete}
        isPending={deleteCategory.isPending}
      />
    </section>
  );
}
