import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTrip } from "./client";
import { tripKeys } from "./keys";

export function useCreateTrip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTrip,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripKeys.lists() }),
  });
}
