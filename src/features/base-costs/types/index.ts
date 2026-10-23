import type { z } from "zod";

import type { baseCostSchema, createBaseCostSchema } from "../schemas/base-cost.schema";

export type BaseCost = z.infer<typeof baseCostSchema>;
export type CreateBaseCostInput = z.infer<typeof createBaseCostSchema>;
