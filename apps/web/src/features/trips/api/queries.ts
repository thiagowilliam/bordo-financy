import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchTrip, fetchTrips } from "./client";
import { tripKeys } from "./keys";

export const tripsQueryOptions = () =>
  queryOptions({ queryKey: tripKeys.lists(), queryFn: fetchTrips });

export const tripQueryOptions = (tripId: string) =>
  queryOptions({ queryKey: tripKeys.detail(tripId), queryFn: () => fetchTrip(tripId) });

export const useTrips = () => useQuery(tripsQueryOptions());

export const useTrip = (tripId: string) => useQuery(tripQueryOptions(tripId));
