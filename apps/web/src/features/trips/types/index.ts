import type { z } from "zod";

import type { createTripSchema, tripSchema, tripSummarySchema } from "@bordo/shared/trips";

export type Trip = z.infer<typeof tripSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
export type TripSummary = z.infer<typeof tripSummarySchema>;
