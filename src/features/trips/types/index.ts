import type { z } from "zod";

import type { createTripSchema, tripSchema } from "../schemas/trip.schema";

export type Trip = z.infer<typeof tripSchema>;
export type CreateTripInput = z.infer<typeof createTripSchema>;
