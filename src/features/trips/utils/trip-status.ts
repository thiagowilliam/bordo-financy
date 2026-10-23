import { differenceInCalendarDays, parseISO } from "date-fns";

import type { Trip } from "../types";

export type TripPhase = "ongoing" | "upcoming" | "completed";

type TripDates = Pick<Trip, "startDate" | "endDate">;

/** `today` is an ISO date (yyyy-MM-dd). Both start and end dates are part of the trip. */
export function getTripPhase({ startDate, endDate }: TripDates, today: string): TripPhase {
  if (today < startDate) return "upcoming";
  if (today > endDate) return "completed";
  return "ongoing";
}

/** "Dia 11 de 15", "Em 133 dias" or "Concluída". */
export function getTripBadgeLabel(trip: TripDates, today: string): string {
  const phase = getTripPhase(trip, today);
  const todayDate = parseISO(today);
  if (phase === "ongoing") {
    const day = differenceInCalendarDays(todayDate, parseISO(trip.startDate)) + 1;
    const total = differenceInCalendarDays(parseISO(trip.endDate), parseISO(trip.startDate)) + 1;
    return `Dia ${day} de ${total}`;
  }
  if (phase === "upcoming") {
    const days = differenceInCalendarDays(parseISO(trip.startDate), todayDate);
    return days === 1 ? "Amanhã" : `Em ${days} dias`;
  }
  return "Concluída";
}
