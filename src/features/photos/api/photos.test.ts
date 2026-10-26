import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { fetchTrip } from "@/features/trips/api/client";
import { LISBON_TRIP_ID } from "@/mocks/fixtures/trips";
import { server } from "@/mocks/server";

import { deletePhoto, fetchPhotos, setCoverPhoto, uploadPhotos } from "./client";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const file = (name: string) => new File(["x"], name, { type: "image/jpeg" });

describe("photos api (msw)", () => {
  it("lists the six Lisboa photos with the cover first", async () => {
    const photos = await fetchPhotos(LISBON_TRIP_ID);
    expect(photos).toHaveLength(6);
    expect(photos[0].isCover).toBe(true);
    expect(photos.filter((photo) => photo.isCover)).toHaveLength(1);
  });

  it("changes the cover and the trip follows it", async () => {
    const [, second] = await fetchPhotos(LISBON_TRIP_ID);
    await setCoverPhoto(LISBON_TRIP_ID, second.id);

    const photos = await fetchPhotos(LISBON_TRIP_ID);
    expect(photos[0].id).toBe(second.id);
    expect((await fetchTrip(LISBON_TRIP_ID)).coverPhotoUrl).toBe(second.url);
  });

  it("uploads files and deletes a photo", async () => {
    const created = await uploadPhotos(LISBON_TRIP_ID, [file("a.jpg"), file("b.jpg")]);
    expect(created).toHaveLength(2);
    expect(await fetchPhotos(LISBON_TRIP_ID)).toHaveLength(8);

    await deletePhoto(LISBON_TRIP_ID, created[0].id);
    expect(await fetchPhotos(LISBON_TRIP_ID)).toHaveLength(7);
    await expect(deletePhoto(LISBON_TRIP_ID, created[0].id)).rejects.toThrow();
  });

  it("promotes the next photo when the cover is deleted", async () => {
    const [cover, next] = await fetchPhotos(LISBON_TRIP_ID);
    await deletePhoto(LISBON_TRIP_ID, cover.id);
    const photos = await fetchPhotos(LISBON_TRIP_ID);
    expect(photos[0].isCover).toBe(true);
    expect(photos.some((photo) => photo.id === cover.id)).toBe(false);
    expect(next).toBeDefined();
  });

  it("refuses more than the photo limit", async () => {
    const many = Array.from({ length: 10 }, (_, i) => file(`m${i}.jpg`));
    await expect(uploadPhotos(LISBON_TRIP_ID, many)).rejects.toThrow();
  });
});
