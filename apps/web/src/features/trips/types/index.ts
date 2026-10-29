import type { z } from "zod";

import type {
  budgetChangeSchema,
  createTripSchema,
  tripDetailSchema,
  tripSchema,
  tripSummarySchema,
  updateTripSchema,
} from "@bordo/shared/trips";

export type Trip = z.infer<typeof tripSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type TripSummary = z.infer<typeof tripSummarySchema>;
export type UpdateTripInput = z.infer<typeof updateTripSchema>;
export type TripDetail = z.infer<typeof tripDetailSchema>;
export type BudgetChange = z.infer<typeof budgetChangeSchema>;
