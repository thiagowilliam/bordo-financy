import { z } from "zod";

export const expenseKindSchema = z.enum(["DAILY", "BASE"]);

export const paymentMethodSchema = z.enum(["CASH", "PIX", "DEBIT", "CREDIT", "INTERNATIONAL_CARD"]);

export const expenseSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  kind: expenseKindSchema,
  categoryId: z.string(),
  paymentMethod: paymentMethodSchema,
  /** Amount as an integer in cents. */
  amountInCents: z.number().int().positive("Informe um valor maior que zero"),
  currency: z.string().length(3),
  date: z.iso.date(),
  description: z.string().min(1, "Informe uma descrição"),
});

export const createExpenseSchema = expenseSchema.omit({ id: true });

export const expenseFiltersSchema = z.object({
  search: z.string().optional(),
  categories: z.array(z.string()).optional(),
  from: z.iso.date().optional(),
  to: z.iso.date().optional(),
  paymentMethod: paymentMethodSchema.optional(),
});
