import type { Trip } from "@/features/trips";

export const LISBON_TRIP_ID = "trip-lisboa-sintra";

export const tripsFixture: Trip[] = [
  {
    id: LISBON_TRIP_ID,
    name: "Lisboa & Sintra",
    destination: "Lisboa, Portugal",
    startDate: "2026-05-12",
    endDate: "2026-05-19",
    budgetInCents: 500000,
    currency: "EUR",
    coverPhotoUrl: null,
  },
  {
    id: "trip-serra-gaucha",
    name: "Serra Gaúcha",
    destination: "Gramado, Brasil",
    startDate: "2026-07-03",
    endDate: "2026-07-08",
    budgetInCents: 350000,
    currency: "BRL",
    coverPhotoUrl: null,
  },
];
