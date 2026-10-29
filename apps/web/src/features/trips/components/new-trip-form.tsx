"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Check, MapPin, Wallet } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { CurrencySelect } from "@/components/atoms/currency-select";
import { TextField } from "@/components/atoms/text-field";
import { DateField } from "@/components/molecules/date-field";
import { FormField } from "@/components/molecules/form-field";
import { MoneyInput } from "@/components/molecules/money-input";
import { PhotoPicker } from "@/components/organisms/photo-picker";
import { Button } from "@/components/ui/button";

import { useQueryClient } from "@tanstack/react-query";

import { uploadPhotos } from "@/features/photos/api/client";

import { useCreateTrip } from "../api/mutations";
import { tripKeys } from "../api/keys";
import { createTripSchema } from "@bordo/shared/trips";
import type { CreateTripInput } from "../types";

const defaultValues: CreateTripInput = {
  name: "",
  destination: "",
  startDate: "",
  endDate: "",
  budgetInCents: 0,
  currency: "BRL",
};

/** Form of the "Nova viagem" screen. Only the cover is picked here; more photos come later. */
export function NewTripForm() {
  const router = useRouter();
  const createTrip = useCreateTrip();
  const queryClient = useQueryClient();
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<CreateTripInput>({
    resolver: zodResolver(createTripSchema),
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  const currency = useWatch({ control, name: "currency" });
  const startDate = useWatch({ control, name: "startDate" });
  const isBusy = createTrip.isPending || isUploading || createTrip.isSuccess;

  function onSubmit(input: CreateTripInput) {
    if (isBusy) return;
    createTrip.mutate(input, {
      onSuccess: async (trip) => {
        if (coverFile) {
          setIsUploading(true);
          try {
            // The first photo of a trip without a cover becomes the cover.
            await uploadPhotos(trip.id, [coverFile]);
            await queryClient.invalidateQueries({ queryKey: tripKeys.all });
          } catch {
            toast.error(
              "A viagem foi criada, mas não foi possível enviar a capa. Tente na aba Fotos.",
            );
          }
        }
        toast.success("Viagem criada");
        router.push(`/viagens/${trip.id}`);
      },
      onError: () => toast.error("Não foi possível criar a viagem. Tente de novo."),
    });
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex w-full flex-col gap-4 md:max-w-180 md:gap-5.5 md:rounded-3xl md:border md:border-border md:bg-card md:p-10"
    >
      <FormField label="Nome da viagem" error={errors.name?.message}>
        {(field) => (
          <TextField
            {...field}
            {...register("name")}
            placeholder="Ex.: Santorini & Mykonos"
            autoComplete="off"
          />
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
                    // A return date before the new departure no longer makes sense.
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
                  defaultMonth={startDate || undefined}
                />
              )}
            />
          )}
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="Moeda da viagem" error={errors.currency?.message}>
          {(field) => (
            <Controller
              control={control}
              name="currency"
              render={({ field: { value, onChange, name } }) => (
                <CurrencySelect {...field} name={name} value={value} onValueChange={onChange} />
              )}
            />
          )}
        </FormField>
        <FormField label="Orçamento total" error={errors.budgetInCents?.message}>
          {(field) => (
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
          )}
        </FormField>
      </div>

      <div className="flex flex-col gap-2">
        <span id="trip-photos-label" className="text-sm font-semibold text-foreground">
          Foto de capa (opcional)
        </span>
        <PhotoPicker
          aria-labelledby="trip-photos-label"
          role="group"
          maxPhotos={1}
          onChange={({ files }) => setCoverFile(files[0] ?? null)}
        />
      </div>

      <div className="flex gap-3 pt-2 md:justify-end">
        <Button
          asChild
          variant="outline"
          className="h-auto gap-2 rounded-lg bg-card px-6 py-3.75 text-base font-semibold [&_svg:not([class*='size-'])]:size-4.5"
        >
          <Link href="/viagens">
            <ArrowLeft aria-hidden="true" />
            Cancelar
          </Link>
        </Button>
        <Button
          type="submit"
          variant="cta"
          disabled={isBusy}
          className="h-auto flex-1 gap-2 rounded-lg px-7 py-3.75 text-base font-bold md:flex-none [&_svg:not([class*='size-'])]:size-4.5"
        >
          <Check aria-hidden="true" />
          {createTrip.isPending || isUploading ? "Criando..." : "Criar viagem"}
        </Button>
      </div>
    </form>
  );
}
