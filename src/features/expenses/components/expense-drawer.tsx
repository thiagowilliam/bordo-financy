"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { Check, Settings2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { AmountInput } from "@/components/molecules/amount-input";
import { DescriptionField } from "@/components/molecules/description-field";
import { SegmentedControl } from "@/components/molecules/segmented-control";
import { CategoryPicker } from "@/components/organisms/category-picker";
import { ConfirmDialog } from "@/components/organisms/confirm-dialog";
import { DrawerShell } from "@/components/organisms/drawer-shell";
import { ExpenseDatePicker } from "@/components/organisms/expense-date-picker";
import { PaymentPicker } from "@/components/organisms/payment-picker";
import { Button } from "@/components/ui/button";
import { useBaseCosts } from "@/features/base-costs";
import { useCategories, useCreateCategory, type Category } from "@/features/categories";
import { useTrip } from "@/features/trips/api/queries";
import type { Trip } from "@/features/trips/types";
import {
  selectExpenseDrawerEditingId,
  selectExpenseDrawerIsOpen,
  selectExpenseDrawerMode,
  useExpenseDrawerStore,
} from "@/stores/expense-drawer";

import { useExpenses } from "../api/queries";
import { useCreateExpense, useDeleteExpense, useUpdateExpense } from "../api/mutations";
import { expenseFormSchema, type ExpenseFormValues } from "../schemas/expense-form.schema";
import type { Expense, ExpenseKind } from "../types";
import { toCreateExpenseInput, toExpenseFormValues } from "../utils/expense-form";

const kindOptions: { value: ExpenseKind; label: string }[] = [
  { value: "DAILY", label: "Dia a dia" },
  { value: "BASE", label: "Custo de base" },
];

const copy = {
  DAILY: {
    categoryLabel: "Categoria",
    manageLabel: "Gerenciar categorias",
    dateLabel: "Data",
    placeholder: "Ex.: Almoço no Time Out Market",
  },
  BASE: {
    categoryLabel: "Tipo de custo",
    manageLabel: "Gerenciar tipos de custo",
    dateLabel: "Data de pagamento",
    placeholder: "Ex.: Apartamento em Alfama · 14 noites",
  },
} as const;

/** Today when it falls inside the trip, otherwise the closest day of the trip. */
function getDefaultDate(trip: Pick<Trip, "startDate" | "endDate">, today: string) {
  if (today < trip.startDate) return trip.startDate;
  if (today > trip.endDate) return trip.endDate;
  return today;
}

type ExpenseFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  context: string;
  mobileContext: string;
  trip: Trip;
  categories: Category[];
  usageByCategory: Map<string, number>;
  editing: Expense | undefined;
  initialKind: ExpenseKind;
  today: string;
  onDone: () => void;
};

/** Form and shell of the drawer. The parent remounts it (by key) on every opening. */
function ExpenseForm({
  open,
  onOpenChange,
  context,
  mobileContext,
  trip,
  categories,
  usageByCategory,
  editing,
  initialKind,
  today,
  onDone,
}: ExpenseFormProps) {
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();
  const createCategory = useCreateCategory();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const editingCategoryName = categories.find((c) => c.id === editing?.categoryId)?.name;
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: editing
      ? toExpenseFormValues(editing, editingCategoryName)
      : {
          kind: initialKind,
          categoryId: "",
          paymentMethod: undefined,
          amountInCents: 0,
          date: getDefaultDate(trip, today),
          description: "",
        },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const kind = useWatch({ control, name: "kind" });
  const labels = copy[kind];
  const isBusy = createExpense.isPending || updateExpense.isPending;

  function onSubmit(values: ExpenseFormValues) {
    if (isBusy) return;
    const categoryName = categories.find((c) => c.id === values.categoryId)?.name ?? "Gasto";
    const input = toCreateExpenseInput(values, {
      tripId: trip.id,
      currency: trip.currency,
      categoryName,
    });
    const handlers = {
      onError: () => toast.error("Não foi possível salvar. Tente de novo."),
    };
    if (editing) {
      updateExpense.mutate(
        { id: editing.id, input },
        {
          ...handlers,
          onSuccess: () => {
            toast.success("Lançamento atualizado");
            onDone();
          },
        },
      );
      return;
    }
    createExpense.mutate(input, {
      ...handlers,
      onSuccess: () => {
        toast.success(input.kind === "BASE" ? "Custo adicionado" : "Gasto lançado");
        onDone();
      },
    });
  }

  function onDelete() {
    if (!editing) return;
    deleteExpense.mutate(
      { tripId: trip.id, id: editing.id },
      {
        onSuccess: () => {
          toast.success("Lançamento excluído");
          setConfirmingDelete(false);
          onDone();
        },
        onError: () => toast.error("Não foi possível excluir. Tente de novo."),
      },
    );
  }

  async function onCreateCategory({ name, icon }: { name: string; icon: Category["icon"] }) {
    const color = ((categories.length % 8) + 1) as Category["color"];
    const created = await createCategory.mutateAsync({ name, icon, color });
    setValue("categoryId", created.id, { shouldValidate: true });
  }

  return (
    <DrawerShell
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? "Editar lançamento" : "Lançar gasto"}
      context={context}
      toolbar={
        <Controller
          control={control}
          name="kind"
          render={({ field }) => (
            <SegmentedControl
              aria-label="Tipo de lançamento"
              options={kindOptions}
              value={field.value}
              onValueChange={(value) => field.onChange(value as ExpenseKind)}
            />
          )}
        />
      }
      description="Informe valor, categoria, forma de pagamento e data do lançamento."
      footer={
        <ExpenseFormFooter
          isEditing={Boolean(editing)}
          onDelete={() => setConfirmingDelete(true)}
        />
      }
    >
      <form
        id="expense-form"
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <p className="text-center text-[13px] text-muted-foreground md:hidden">{mobileContext}</p>

        <Controller
          control={control}
          name="amountInCents"
          render={({ field }) => (
            <AmountInput
              value={field.value}
              currency={trip.currency}
              onValueChange={field.onChange}
              error={errors.amountInCents?.message}
              autoFocus
            />
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <Controller
            control={control}
            name="categoryId"
            render={({ field }) => (
              <CategoryPicker
                label={labels.categoryLabel}
                value={field.value || undefined}
                onValueChange={field.onChange}
                categories={categories.map((category) => ({
                  id: category.id,
                  name: category.name,
                  icon: category.icon,
                  color: category.color,
                  usageCount: usageByCategory.get(category.id) ?? 0,
                }))}
                onCreateCategory={onCreateCategory}
                isCreating={createCategory.isPending}
                error={errors.categoryId?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="paymentMethod"
            render={({ field }) => (
              <PaymentPicker
                value={field.value}
                onValueChange={field.onChange}
                error={errors.paymentMethod?.message}
              />
            )}
          />
        </div>

        <Link
          href="/configuracoes/categorias"
          className="flex w-fit items-center gap-1.5 rounded-sm text-[13px] font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Settings2 aria-hidden="true" className="size-3.5" />
          {labels.manageLabel}
        </Link>

        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <ExpenseDatePicker
              label={labels.dateLabel}
              value={field.value}
              onValueChange={field.onChange}
              today={today}
              tripStartDate={trip.startDate}
              tripEndDate={trip.endDate}
              error={errors.date?.message}
            />
          )}
        />

        <DescriptionField placeholder={labels.placeholder} {...register("description")} />
      </form>

      <ConfirmDialog
        open={confirmingDelete}
        onOpenChange={setConfirmingDelete}
        title="Excluir lançamento?"
        description="Essa ação não pode ser desfeita. O valor sai dos totais da viagem."
        onConfirm={onDelete}
        isPending={deleteExpense.isPending}
      />
    </DrawerShell>
  );
}

function ExpenseFormFooter({ isEditing, onDelete }: { isEditing: boolean; onDelete: () => void }) {
  return (
    <>
      <Button
        type="submit"
        form="expense-form"
        variant="cta"
        className="h-auto w-full gap-2 rounded-lg px-5.5 py-4.25 text-base font-bold [&_svg:not([class*='size-'])]:size-4.5"
      >
        <Check aria-hidden="true" />
        {isEditing ? "Salvar alterações" : "Salvar gasto"}
      </Button>
      {isEditing ? (
        <Button
          type="button"
          variant="ghost"
          onClick={onDelete}
          className="h-auto w-full rounded-lg py-3 text-sm font-semibold text-destructive hover:text-destructive"
        >
          Excluir lançamento
        </Button>
      ) : (
        <p className="hidden justify-center text-xs text-subtle-foreground md:flex">
          Enter para salvar · Esc para fechar
        </p>
      )}
    </>
  );
}

function TripExpenseDrawer({ tripId }: { tripId: string }) {
  const isOpen = useExpenseDrawerStore(selectExpenseDrawerIsOpen);
  const mode = useExpenseDrawerStore(selectExpenseDrawerMode);
  const editingId = useExpenseDrawerStore(selectExpenseDrawerEditingId);
  const close = useExpenseDrawerStore((state) => state.close);

  const trip = useTrip(tripId);
  const categories = useCategories();
  const daily = useExpenses(tripId);
  const baseCosts = useBaseCosts(tripId);

  const today = useMemo(() => format(new Date(), "yyyy-MM-dd"), []);

  // A new session (and so a fresh form) starts every time the drawer goes from closed to open.
  const [session, setSession] = useState(0);
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setSession((current) => current + 1);
  }

  const allExpenses = useMemo(
    () => [...(daily.data ?? []), ...(baseCosts.data ?? [])],
    [daily.data, baseCosts.data],
  );
  const usageByCategory = useMemo(() => {
    const usage = new Map<string, number>();
    for (const expense of allExpenses) {
      usage.set(expense.categoryId, (usage.get(expense.categoryId) ?? 0) + 1);
    }
    return usage;
  }, [allExpenses]);
  const editing = editingId ? allExpenses.find((expense) => expense.id === editingId) : undefined;

  if (!trip.data || !categories.data || session === 0) return null;
  if (editingId && !editing && isOpen) return null;

  const tripDay = differenceInCalendarDays(parseISO(today), parseISO(trip.data.startDate)) + 1;
  const isInsideTrip = today >= trip.data.startDate && today <= trip.data.endDate;
  const context = isInsideTrip ? `${trip.data.name} · Dia ${tripDay}` : trip.data.name;

  return (
    <ExpenseForm
      key={session}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) close();
      }}
      context={context}
      mobileContext={isInsideTrip ? `${context} · Hoje` : context}
      trip={trip.data}
      categories={categories.data}
      usageByCategory={usageByCategory}
      editing={editing}
      initialKind={mode}
      today={today}
      onDone={close}
    />
  );
}

/** Drawer to launch, edit and delete an expense of the trip being viewed. */
export function ExpenseDrawer() {
  const { tripId } = useParams<{ tripId?: string }>();
  return tripId ? <TripExpenseDrawer tripId={tripId} /> : null;
}
