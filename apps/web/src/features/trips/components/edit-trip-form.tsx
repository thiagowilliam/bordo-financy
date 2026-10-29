"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { ArrowLeft, Check, Lock, MapPin, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { CurrencySelect } from "@/components/atoms/currency-select";
import { TextField } from "@/components/atoms/text-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { FormNotice } from "@/components/molecules/form-notice";
import { MoneyInput } from "@/components/molecules/money-input";
import { PhotoThumbnail } from "@/components/molecules/photo-thumbnail";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useBaseCosts } from "@/features/base-costs";
import { useExpenses } from "@/features/expenses";
import { usePhotos, useSetCoverPhoto } from "@/features/photos";
import { ApiError } from "@/lib/api-client";
import { formatMoney } from "@/lib/money";

import { updateTripSchema } from "@bordo/shared/trips";
import { useUpdateTrip } from "../api/mutations";
import { useTrip } from "../api/queries";
import type { Expense } from "@/features/expenses";
import type { Photo } from "@/features/photos";
import type { Trip, UpdateTripInput } from "../types";
import {
  countExpensesOutside,
  describePhaseChange,
  outsidePeriodMessage,
} from "../utils/trip-edit";

const sameTrip = (a: UpdateTripInput, b: Trip) =>
  a.name === b.name &&
  a.destination === b.destination &&
  a.startDate === b.startDate &&
  a.endDate === b.endDate &&
  a.currency === b.currency &&
  a.budgetInCents === b.budgetInCents;

type EditTripFormFieldsProps = {
  trip: Trip;
  expenses: Expense[];
  photos: Photo[];
  today: string;
};

function EditTripFormFields({ trip, expenses, photos, today }: EditTripFormFieldsProps) {
  const router = useRouter();
  const updateTrip = useUpdateTrip(trip.id);
  const setCover = useSetCoverPhoto(trip.id);
  const currentCoverId = photos.find((photo) => photo.isCover)?.id ?? null;
  const [coverId, setCoverId] = useState(currentCoverId);

  const defaults: UpdateTripInput = {
    name: trip.name,
    destination: trip.destination,
    startDate: trip.startDate,
    endDate: trip.endDate,
    currency: trip.currency as UpdateTripInput["currency"],
    budgetInCents: trip.budgetInCents,
  };
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<UpdateTripInput>({
    resolver: zodResolver(updateTripSchema),
    defaultValues: defaults,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const values = useWatch({ control }) as UpdateTripInput;
  const { startDate, endDate, budgetInCents, currency } = values;

  const spentInCents = useMemo(
    () => expenses.reduce((total, expense) => total + expense.amountInCents, 0),
    [expenses],
  );
  const outsideCount =
    startDate && endDate
      ? countExpensesOutside(
          expenses.filter((expense) => expense.kind === "DAILY"),
          { startDate, endDate },
        )
      : 0;
  const phaseNotice =
    startDate && endDate && endDate >= startDate
      ? describePhaseChange(trip, { startDate, endDate }, today)
      : null;
  const isBelowSpent = budgetInCents > 0 && budgetInCents < spentInCents;
  const isCurrencyLocked = expenses.length > 0;

  const isChanged = !sameTrip(values, trip) || coverId !== currentCoverId;
  const isBusy = updateTrip.isPending || setCover.isPending || updateTrip.isSuccess;

  async function onSubmit(input: UpdateTripInput) {
    if (isBusy || outsideCount > 0) return;
    try {
      await updateTrip.mutateAsync(input);
      if (coverId && coverId !== currentCoverId) await setCover.mutateAsync(coverId);
      toast.success("Viagem atualizada");
      router.push(`/viagens/${trip.id}`);
    } catch (error) {
      toast.error(
        error instanceof ApiError && error.status === 409
          ? "Os dados da viagem mudaram. Confira as datas e a moeda."
          : "Não foi possível salvar a viagem. Tente de novo.",
      );
    }
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-4 md:max-w-180 md:gap-5.5 md:rounded-3xl md:border md:border-border md:bg-card md:p-10"
    >
      <FormField label="Nome da viagem" error={errors.name?.message}>
        {(field) => (
          <TextField {...field} {...register("name")} placeholder="Ex.: Santorini & Mykonos" />
        )}
      </FormField>

      <FormField label="Destino" error={errors.destination?.message}>
        {(field) => (
          <TextField
            {...field}
            {...register("destination")}
            icon={<MapPin />}
            placeholder="Ex.: Grécia"
            autoComplete="off"
          />
        )}
      </FormField>

      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <FormField label="Data de ida" error={errors.startDate?.message}>
            {(field) => (
              <Controller
                control={control}
                name="startDate"
                render={({ field: { value, onChange, name } }) => (
                  <DateField
                    {...field}
                    name={name}
                    value={value}
                    onChange={(next) => {
                      onChange(next);
                      const end = getValues("endDate");
                      if (end && end < next) setValue("endDate", "");
                    }}
                  />
                )}
              />
            )}
          </FormField>
          <FormField label="Data de volta" error={errors.endDate?.message}>
            {(field) => (
              <Controller
                control={control}
                name="endDate"
                render={({ field: { value, onChange, name } }) => (
                  <DateField
                    {...field}
                    name={name}
                    value={value}
                    onChange={onChange}
                    minDate={startDate || undefined}
                    defaultMonth={endDate || startDate || undefined}
                  />
                )}
              />
            )}
          </FormField>
        </div>
        {outsideCount > 0 ? (
          <FormNotice tone="error" compact>
            {outsidePeriodMessage(outsideCount)}{" "}
            <Link
              href={`/viagens/${trip.id}/dia-a-dia?periodo=all`}
              className="font-bold underline underline-offset-2"
            >
              Ver gastos
            </Link>
          </FormNotice>
        ) : null}
        {phaseNotice ? (
          <FormNotice tone="info" compact>
            {phaseNotice}
          </FormNotice>
        ) : null}
      </div>

      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2">
        <FormField
          label="Moeda da viagem"
          error={errors.currency?.message}
          hint={
            isCurrencyLocked
              ? "A moeda não pode ser alterada depois que a viagem tem gastos."
              : undefined
          }
        >
          {(field) => (
            <Controller
              control={control}
              name="currency"
              render={({ field: { value, onChange, name } }) => (
                <div className="relative">
                  <CurrencySelect
                    {...field}
                    name={name}
                    value={value}
                    onValueChange={onChange}
                    disabled={isCurrencyLocked}
                    className={isCurrencyLocked ? "bg-muted pr-11" : undefined}
                  />
                  {isCurrencyLocked ? (
                    <Lock
                      aria-hidden="true"
                      className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                  ) : null}
                </div>
              )}
            />
          )}
        </FormField>
        <FormField label="Orçamento total" error={errors.budgetInCents?.message}>
          {(field) => (
            <>
              <Controller
                control={control}
                name="budgetInCents"
                render={({ field: { value, onChange, onBlur, name } }) => (
                  <MoneyInput
                    {...field}
                    name={name}
                    icon={<Wallet />}
                    placeholder="0,00"
                    currency={currency}
                    value={value}
                    onValueChange={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              {isBelowSpent ? (
                <FormNotice tone="warning" compact>
                  O orçamento ficará abaixo dos {formatMoney(spentInCents, trip.currency)} já
                  gastos.
                </FormNotice>
              ) : null}
            </>
          )}
        </FormField>
      </div>

      {photos.length > 0 ? (
        <div className="flex flex-col gap-2">
          <span id="trip-photos-label" className="text-sm font-semibold text-foreground">
            Fotos do destino
          </span>
          <ul aria-labelledby="trip-photos-label" className="grid grid-cols-4 gap-2.5 md:gap-3.5">
            {photos.map((photo) => (
              <li key={photo.id}>
                <PhotoThumbnail
                  src={photo.url}
                  alt={photo.name}
                  isCover={photo.id === coverId}
                  onSetCover={() => setCoverId(photo.id)}
                />
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-muted-foreground">
            Para adicionar ou remover fotos, use a aba Fotos da viagem.
          </p>
        </div>
      ) : null}

      <div className="flex gap-3 pt-2 md:justify-end">
        <Button
          asChild
          variant="outline"
          className="h-auto gap-2 rounded-lg bg-card px-6 py-3.75 text-base font-semibold [&_svg:not([class*='size-'])]:size-4.5"
        >
          <Link href={`/viagens/${trip.id}`}>
            <ArrowLeft aria-hidden="true" />
            Cancelar
          </Link>
        </Button>
        <Button
          type="submit"
          variant="cta"
          disabled={isBusy || !isChanged || outsideCount > 0}
          className="h-auto flex-1 gap-2 rounded-lg px-7 py-3.75 text-base font-bold md:flex-none [&_svg:not([class*='size-'])]:size-4.5"
        >
          <Check aria-hidden="true" />
          {updateTrip.isPending || setCover.isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}

export type EditTripFormProps = {
  tripId: string;
  /** ISO date (yyyy-MM-dd) used to tell the status the new dates give. Defaults to today. */
  today?: string;
};

/** Form of the "Editar viagem" screen: the trip, its expenses and photos are loaded first. */
export function EditTripForm({ tripId, today }: EditTripFormProps) {
  const trip = useTrip(tripId);
  const daily = useExpenses(tripId);
  const base = useBaseCosts(tripId);
  const photos = usePhotos(tripId);
  const todayIso = today ?? format(new Date(), "yyyy-MM-dd");

  if (trip.error instanceof ApiError && trip.error.status === 404) {
    return (
      <div role="alert" className="rounded-xl border border-border bg-card px-6 py-10 text-center">
        <p className="text-base text-foreground">Viagem não encontrada.</p>
      </div>
    );
  }

  if ([trip, daily, base, photos].some((query) => query.isError)) {
    return (
      <div
        role="alert"
        className="flex flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-10 text-center"
      >
        <p className="text-base text-foreground">Não foi possível carregar a viagem.</p>
        <Button
          variant="outline"
          onClick={() =>
            [trip, daily, base, photos].filter((q) => q.isError).forEach((q) => void q.refetch())
          }
        >
          Tentar de novo
        </Button>
      </div>
    );
  }

  if (!trip.data || !daily.data || !base.data || !photos.data) {
    return (
      <div role="status" aria-busy="true" aria-label="Carregando viagem">
        <Skeleton className="h-130 w-full rounded-3xl md:max-w-180" />
      </div>
    );
  }

  return (
    <EditTripFormFields
      trip={trip.data}
      expenses={[...daily.data, ...base.data]}
      photos={photos.data}
      today={todayIso}
    />
  );
}
