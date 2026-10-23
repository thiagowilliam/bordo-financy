import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchBaseCosts } from "./client";
import { baseCostKeys } from "./keys";

export const baseCostsQueryOptions = (tripId: string) =>
  queryOptions({ queryKey: baseCostKeys.list(tripId), queryFn: () => fetchBaseCosts(tripId) });

export const useBaseCosts = (tripId: string) => useQuery(baseCostsQueryOptions(tripId));
