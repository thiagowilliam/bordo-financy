import { z } from "zod";

import { apiFetch } from "@/lib/api-client";

import { tripSchema } from "../schemas/trip.schema";
import type { CreateTripInput } from "../types";

export const fetchTrips = () => apiFetch("/api/trips", z.array(tripSchema));

export const fetchTrip = (tripId: string) => apiFetch(`/api/trips/${tripId}`, tripSchema);

export const createTrip = (input: CreateTripInput) =>
  apiFetch("/api/trips", tripSchema, { method: "POST", body: input });
