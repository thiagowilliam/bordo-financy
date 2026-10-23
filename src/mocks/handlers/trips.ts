import { http, HttpResponse } from "msw/http";

import { createTripSchema, type TripSummary } from "@/features/trips";

import { db } from "./db";

export const tripHandlers = [
  http.get("/api/trips", () => {
    const summaries: TripSummary[] = db.trips.map((trip) => ({
      ...trip,
      spentInCents: db.expenses
        .filter((expense) => expense.tripId === trip.id)
        .reduce((total, expense) => total + expense.amountInCents, 0),
    }));
    return HttpResponse.json(summaries);
  }),

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
