import type { QueryClient } from "@tanstack/react-query";

import { deleteTrip } from "../api/client";
import { tripKeys } from "../api/keys";
import type { TripSummary } from "../types";

export const UNDO_WINDOW_MS = 8000;

type Pending = { timer: ReturnType<typeof setTimeout>; commit: () => Promise<void> };

/**
 * Deletions waiting for their undo window. They live outside React: the screen that started one
 * (a card menu, the trip overview) may unmount, for instance when going back to the list.
 */
const pending = new Map<string, Pending>();

let flushRegistered = false;

/** Closing the tab inside the window still deletes: the user already confirmed it. */
function registerFlushOnPageHide() {
  if (flushRegistered || typeof window === "undefined") return;
  flushRegistered = true;
  window.addEventListener("pagehide", () => {
    for (const [tripId, entry] of pending) {
      clearTimeout(entry.timer);
      pending.delete(tripId);
      void deleteTrip(tripId, { keepalive: true }).catch(() => undefined);
    }
  });
}

type ScheduleOptions = {
  queryClient: QueryClient;
  tripId: string;
  onDeleted: () => void;
  onFailed: () => void;
};

/**
 * Takes the trip off the list right away and deletes it for real once the window ends.
 * Returns the function that undoes it.
 */
export function scheduleTripDeletion({
  queryClient,
  tripId,
  onDeleted,
  onFailed,
}: ScheduleOptions): () => void {
  registerFlushOnPageHide();

  queryClient.setQueryData<TripSummary[]>(tripKeys.lists(), (trips) =>
    trips?.filter((trip) => trip.id !== tripId),
  );

  const commit = async () => {
    pending.delete(tripId);
    try {
      await deleteTrip(tripId);
      queryClient.removeQueries({ queryKey: tripKeys.detail(tripId) });
      onDeleted();
    } catch {
      onFailed();
    } finally {
      await queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
    }
  };

  pending.set(tripId, { timer: setTimeout(() => void commit(), UNDO_WINDOW_MS), commit });

  return () => {
    const entry = pending.get(tripId);
    if (!entry) return;
    clearTimeout(entry.timer);
    pending.delete(tripId);
    void queryClient.invalidateQueries({ queryKey: tripKeys.lists() });
  };
}

/** Test helper: whether a trip is waiting for its window to end. */
export const isTripDeletionPending = (tripId: string) => pending.has(tripId);
