import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTrip, deleteTrip, updateTrip } from "./client";
import { tripKeys } from "./keys";
import type { UpdateTripInput } from "../types";

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripKeys.lists() }),
  });
}

export function useUpdateTrip(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateTripInput) => updateTrip(tripId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripKeys.all }),
  });
}

export function useDeleteTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tripId: string) => deleteTrip(tripId),
    onSuccess: (_deleted, tripId) => {
      queryClient.removeQueries({ queryKey: tripKeys.detail(tripId) });
      return queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    },
  });
}
