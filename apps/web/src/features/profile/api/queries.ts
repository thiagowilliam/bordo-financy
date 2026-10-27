import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchProfile, fetchProfileStats } from "./client";
import { profileKeys } from "./keys";

export const profileQueryOptions = () =>
  queryOptions({ queryKey: profileKeys.detail(), queryFn: fetchProfile });

export const profileStatsQueryOptions = () =>
  queryOptions({ queryKey: profileKeys.stats(), queryFn: fetchProfileStats });

export const useProfile = () => useQuery(profileQueryOptions());

export const useProfileStats = () => useQuery(profileStatsQueryOptions());
