import { z } from "zod";

import { SUPPORTED_CURRENCY_CODES } from "../common/currencies";

const isoDate = z.iso.date();

export const tripSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Informe o nome da viagem"),
  destination: z.string().min(1, "Informe o destino"),
  startDate: isoDate,
  endDate: isoDate,
  /** Budget as an integer in cents. */
  budgetInCents: z.number().int().nonnegative(),
  currency: z.string().length(3),
  coverPhotoUrl: z.string().nullable(),
});

/** What the trips list needs: the trip plus the total already spent, computed by the API. */
export const tripSummarySchema = tripSchema.extend({
  spentInCents: z.number().int().nonnegative(),
});

const requiredIsoDate = (requiredMessage: string) =>
  z.string().min(1, requiredMessage).pipe(z.iso.date("Data inválida"));

export const createTripSchema = z
  .object({
    name: z.string().trim().min(1, "Informe o nome da viagem"),
    destination: z.string().trim().min(1, "Informe o destino"),
    startDate: requiredIsoDate("Informe a data de ida"),
    endDate: requiredIsoDate("Informe a data de volta"),
    /** Budget as an integer in minor units (cents, or whole yen for JPY). */
    budgetInCents: z
      .number("Informe o orçamento")
      .int()
      .positive("Informe um orçamento maior que zero"),
    currency: z.enum(SUPPORTED_CURRENCY_CODES, "Selecione a moeda"),
  })
  .refine((trip) => trip.endDate >= trip.startDate, {
    path: ["endDate"],
    message: "A data de volta não pode ser antes da ida",
  });
