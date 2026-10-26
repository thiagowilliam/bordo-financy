import { z } from "zod";

import { apiFetch } from "@/lib/api-client";

import { deletedPhotoSchema, photoSchema } from "../schemas/photo.schema";

export const fetchPhotos = (tripId: string) =>
  apiFetch(`/api/trips/${tripId}/photos`, z.array(photoSchema));

export function uploadPhotos(tripId: string, files: File[]) {
  const body = new FormData();
  for (const file of files) body.append("files", file);
  return apiFetch(`/api/trips/${tripId}/photos`, z.array(photoSchema), { method: "POST", body });
}

export const setCoverPhoto = (tripId: string, photoId: string) =>
  apiFetch(`/api/trips/${tripId}/cover`, photoSchema, { method: "PUT", body: { photoId } });

export const deletePhoto = (tripId: string, photoId: string) =>
  apiFetch(`/api/trips/${tripId}/photos/${photoId}`, deletedPhotoSchema, { method: "DELETE" });
