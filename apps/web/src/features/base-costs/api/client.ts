import { z } from "zod";

import { apiFetch } from "@/lib/api-client";

import { baseCostSchema } from "@bordo/shared/base-costs";

export const fetchBaseCosts = (tripId: string) =>
  apiFetch(`/api/trips/${tripId}/base-costs`, z.array(baseCostSchema));
