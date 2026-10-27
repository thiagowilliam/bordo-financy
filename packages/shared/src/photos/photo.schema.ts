import { z } from "zod";

export const photoSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  name: z.string(),
  url: z.string(),
  /** The trip cover photo. The API returns it first. */
  isCover: z.boolean(),
});

export const deletedPhotoSchema = z.object({ id: z.string() });

export const setCoverInputSchema = z.object({ photoId: z.string() });
