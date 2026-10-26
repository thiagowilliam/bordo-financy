import { http, HttpResponse } from "msw/http";

import { setCoverInputSchema } from "@/features/photos";
import { MAX_PHOTOS } from "@/lib/photos";

import { db } from "./db";

/** Photos of a trip as the API returns them: the cover first. */
function listPhotos(tripId: string) {
  const coverUrl = db.trips.find((trip) => trip.id === tripId)?.coverPhotoUrl ?? null;
  const photos = db.photos
    .filter((photo) => photo.tripId === tripId)
    .map((photo) => ({ ...photo, isCover: photo.url === coverUrl }));
  return photos.toSorted((a, b) => Number(b.isCover) - Number(a.isCover));
}

export const photoHandlers = [
  http.get("/api/trips/:tripId/photos", ({ params }) => {
    const tripId = String(params.tripId);
    if (!db.trips.some((trip) => trip.id === tripId))
      return new HttpResponse(null, { status: 404 });
    return HttpResponse.json(listPhotos(tripId));
  }),

  http.post("/api/trips/:tripId/photos", async ({ params, request }) => {
    const tripId = String(params.tripId);
    const trip = db.trips.find((item) => item.id === tripId);
    if (!trip) return new HttpResponse(null, { status: 404 });

    const files = (await request.formData())
      .getAll("files")
      .filter((entry): entry is File => typeof entry !== "string");
    const current = db.photos.filter((photo) => photo.tripId === tripId).length;
    if (files.length === 0 || current + files.length > MAX_PHOTOS) {
      return new HttpResponse(null, { status: 422 });
    }

    const created = files.map((file) => ({
      id: `photo-${crypto.randomUUID()}`,
      tripId,
      name: file.name,
      // The browser keeps the file alive for this URL; there is no storage behind the mock.
      url:
        typeof URL.createObjectURL === "function"
          ? URL.createObjectURL(file)
          : `blob:mock/${file.name}`,
    }));
    db.photos.push(...created);
    if (!trip.coverPhotoUrl) trip.coverPhotoUrl = created[0].url;
    return HttpResponse.json(
      listPhotos(tripId).filter((photo) => created.some((c) => c.id === photo.id)),
      { status: 201 },
    );
  }),

  http.put("/api/trips/:tripId/cover", async ({ params, request }) => {
    const tripId = String(params.tripId);
    const trip = db.trips.find((item) => item.id === tripId);
    const { photoId } = setCoverInputSchema.parse(await request.json());
    const photo = db.photos.find((item) => item.id === photoId && item.tripId === tripId);
    if (!trip || !photo) return new HttpResponse(null, { status: 404 });
    trip.coverPhotoUrl = photo.url;
    return HttpResponse.json({ ...photo, isCover: true });
  }),

  http.delete("/api/trips/:tripId/photos/:photoId", ({ params }) => {
    const tripId = String(params.tripId);
    const index = db.photos.findIndex(
      (photo) => photo.id === params.photoId && photo.tripId === tripId,
    );
    if (index === -1) return new HttpResponse(null, { status: 404 });
    const [removed] = db.photos.splice(index, 1);
    const trip = db.trips.find((item) => item.id === tripId);
    if (trip && trip.coverPhotoUrl === removed.url) {
      // Deleting the cover promotes the photo that was next, or clears the cover.
      trip.coverPhotoUrl = db.photos.find((photo) => photo.tripId === tripId)?.url ?? null;
    }
    return HttpResponse.json({ id: removed.id });
  }),
];
