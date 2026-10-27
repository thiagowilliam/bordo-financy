import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchResetToken } from "./client";
import { authKeys } from "./keys";

/** No retries: a `410` means the link is spent, and asking again will not change that. */
export const resetTokenQueryOptions = (token: string) =>
  queryOptions({
    queryKey: authKeys.resetToken(token),
    queryFn: () => fetchResetToken(token),
    retry: false,
    staleTime: Infinity,
  });

export const useResetToken = (token: string) => useQuery(resetTokenQueryOptions(token));
