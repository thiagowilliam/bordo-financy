import { z } from "zod";

import { expenseSchema } from "@/features/expenses/schemas/expense.schema";

/** A base cost is an expense of kind BASE (flights, lodging, car rental, insurance...). */
export const baseCostSchema = expenseSchema.extend({ kind: z.literal("BASE") });

export const createBaseCostSchema = baseCostSchema.omit({ id: true });
