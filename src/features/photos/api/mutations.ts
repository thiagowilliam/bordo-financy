import { useMutation, useQueryClient } from "@tanstack/react-query";

import { tripKeys } from "@/features/trips/api/keys";

import { deletePhoto, setCoverPhoto, uploadPhotos } from "./client";
import { photoKeys } from "./keys";

/** The cover photo is shown by the trips list and the sidebar, so trips are refreshed too. */
function useInvalidatePhotoQueries() {
  const queryClient = useQueryClient();
  return (tripId: string) =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: photoKeys.list(tripId) }),
      queryClient.invalidateQueries({ queryKey: tripKeys.all }),
    ]);
}

export function useUploadPhotos(tripId: string) {
  const invalidate = useInvalidatePhotoQueries();
  return useMutation({
    mutationFn: (files: File[]) => uploadPhotos(tripId, files),
    onSuccess: () => invalidate(tripId),
  });
}

export function useSetCoverPhoto(tripId: string) {
  const invalidate = useInvalidatePhotoQueries();
  return useMutation({
    mutationFn: (photoId: string) => setCoverPhoto(tripId, photoId),
    onSuccess: () => invalidate(tripId),
  });
}

export function useDeletePhoto(tripId: string) {
  const invalidate = useInvalidatePhotoQueries();
  return useMutation({
    mutationFn: (photoId: string) => deletePhoto(tripId, photoId),
    onSuccess: () => invalidate(tripId),
  });
}
