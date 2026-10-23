import { http, HttpResponse } from "msw/http";

import { createTripSchema } from "@/features/trips";

import { db } from "./db";

export const tripHandlers = [
  http.get("/api/trips", () => HttpResponse.json(db.trips)),

  http.get("/api/trips/:tripId", ({ params }) => {
    const trip = db.trips.find((item) => item.id === params.tripId);
    return trip ? HttpResponse.json(trip) : new HttpResponse(null, { status: 404 });
  }),

  http.post("/api/trips", async ({ request }) => {
    const input = createTripSchema.parse(await request.json());
    const trip = { ...input, id: `trip-${crypto.randomUUID()}`, coverPhotoUrl: null };
    db.trips.unshift(trip);
    return HttpResponse.json(trip, { status: 201 });
  }),
];
