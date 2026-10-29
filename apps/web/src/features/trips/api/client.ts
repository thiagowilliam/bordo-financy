import { z } from "zod";

import { apiFetch } from "@/lib/api-client";

import {
  deletedTripSchema,
  tripDetailSchema,
  tripSchema,
  tripSummarySchema,
} from "@bordo/shared/trips";
import type { CreateTripInput, UpdateTripInput } from "../types";

export const fetchTrips = () => apiFetch("/api/trips", z.array(tripSummarySchema));

export const fetchTrip = (tripId: string) => apiFetch(`/api/trips/${tripId}`, tripDetailSchema);

export const createTrip = (input: CreateTripInput) =>
  apiFetch("/api/trips", tripSchema, { method: "POST", body: input });

export const updateTrip = (tripId: string, input: UpdateTripInput) =>
  apiFetch(`/api/trips/${tripId}`, tripDetailSchema, { method: "PUT", body: input });

/** `keepalive` lets the request finish while the page is being closed. */
export const deleteTrip = (tripId: string, { keepalive = false } = {}) =>
  apiFetch(`/api/trips/${tripId}`, deletedTripSchema, { method: "DELETE", keepalive });
