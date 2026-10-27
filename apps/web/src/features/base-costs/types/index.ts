import type { z } from "zod";

import type { baseCostSchema, createBaseCostSchema } from "@bordo/shared/base-costs";

export type BaseCost = z.infer<typeof baseCostSchema>;
export type CreateBaseCostInput = z.infer<typeof createBaseCostSchema>;
