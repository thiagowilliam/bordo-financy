import { queryOptions, useQuery } from "@tanstack/react-query";

import { fetchPhotos } from "./client";
import { photoKeys } from "./keys";

export const photosQueryOptions = (tripId: string) =>
  queryOptions({ queryKey: photoKeys.list(tripId), queryFn: () => fetchPhotos(tripId) });

export const usePhotos = (tripId: string) => useQuery(photosQueryOptions(tripId));
