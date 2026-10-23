import { z } from "zod";

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

export const createTripSchema = tripSchema
  .omit({ id: true, coverPhotoUrl: true })
  .refine((trip) => trip.endDate >= trip.startDate, {
    path: ["endDate"],
    message: "A data final deve ser depois da inicial",
  });
