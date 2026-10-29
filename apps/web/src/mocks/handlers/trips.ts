import { http, HttpResponse } from "msw/http";

import { createTripSchema, updateTripSchema, type TripSummary } from "@/features/trips";

import { db } from "./db";

const conflict = (message: string) => HttpResponse.json({ message }, { status: 409 });

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
    if (!trip) return new HttpResponse(null, { status: 404 });
    return HttpResponse.json({ ...trip, lastBudgetChange: db.budgetChanges[trip.id] ?? null });
  }),

  http.post("/api/trips", async ({ request }) => {
    const input = createTripSchema.parse(await request.json());
    const trip = { ...input, id: `trip-${crypto.randomUUID()}`, coverPhotoUrl: null };
    db.trips.unshift(trip);
    return HttpResponse.json(trip, { status: 201 });
  }),

  http.put("/api/trips/:tripId", async ({ params, request }) => {
    const index = db.trips.findIndex((item) => item.id === params.tripId);
    if (index === -1) return new HttpResponse(null, { status: 404 });
    const current = db.trips[index];
    const input = updateTripSchema.parse(await request.json());
    const expenses = db.expenses.filter((expense) => expense.tripId === current.id);

    if (input.currency !== current.currency && expenses.length > 0) {
      return conflict("A moeda não pode ser alterada depois que a viagem tem gastos");
    }
    const outside = expenses.filter(
      (expense) =>
        (expense.kind === "DAILY" && expense.date < input.startDate) ||
        expense.date > input.endDate,
    ).length;
    if (outside > 0) return conflict(`${outside} gastos ficariam fora do novo período`);

    if (input.budgetInCents !== current.budgetInCents) {
      db.budgetChanges[current.id] = {
        fromInCents: current.budgetInCents,
        toInCents: input.budgetInCents,
        changedAt: new Date().toISOString(),
      };
    }
    const trip = { ...current, ...input };
    db.trips[index] = trip;
    return HttpResponse.json({ ...trip, lastBudgetChange: db.budgetChanges[trip.id] ?? null });
  }),

  http.delete("/api/trips/:tripId", ({ params }) => {
    const tripId = String(params.tripId);
    if (!db.trips.some((item) => item.id === tripId))
      return new HttpResponse(null, { status: 404 });
    db.trips = db.trips.filter((item) => item.id !== tripId);
    db.expenses = db.expenses.filter((expense) => expense.tripId !== tripId);
    db.photos = db.photos.filter((photo) => photo.tripId !== tripId);
    delete db.budgetChanges[tripId];
    return HttpResponse.json({ id: tripId });
  }),
];
