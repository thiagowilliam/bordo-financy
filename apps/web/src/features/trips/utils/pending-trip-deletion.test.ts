import { QueryClient } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { tripKeys } from "../api/keys";
import type { TripSummary } from "../types";
import {
  isTripDeletionPending,
  scheduleTripDeletion,
  UNDO_WINDOW_MS,
} from "./pending-trip-deletion";

const deleteTrip = vi.fn();
vi.mock("../api/client", () => ({ deleteTrip: (...args: unknown[]) => deleteTrip(...args) }));

const trip = (id: string): TripSummary => ({
  id,
  name: id,
  destination: "x",
  startDate: "2026-10-12",
  endDate: "2026-10-26",
  budgetInCents: 1000,
  currency: "EUR",
  coverPhotoUrl: null,
  spentInCents: 0,
});

describe("scheduleTripDeletion", () => {
  let queryClient: QueryClient;
  const onDeleted = vi.fn();
  const onFailed = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    deleteTrip.mockReset().mockResolvedValue({ id: "a" });
    onDeleted.mockReset();
    onFailed.mockReset();
    queryClient = new QueryClient();
    queryClient.setQueryData(tripKeys.lists(), [trip("a"), trip("b")]);
  });
  afterEach(() => vi.useRealTimers());

  const schedule = (tripId = "a") =>
    scheduleTripDeletion({ queryClient, tripId, onDeleted, onFailed });

  it("hides the trip at once and deletes only when the window ends", async () => {
    schedule();
    expect(queryClient.getQueryData<TripSummary[]>(tripKeys.lists())?.map((t) => t.id)).toEqual([
      "b",
    ]);
    expect(deleteTrip).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(UNDO_WINDOW_MS);
    expect(deleteTrip).toHaveBeenCalledWith("a");
    expect(onDeleted).toHaveBeenCalledOnce();
    expect(isTripDeletionPending("a")).toBe(false);
  });

  it("never calls the API when undone", async () => {
    const undo = schedule();
    await vi.advanceTimersByTimeAsync(UNDO_WINDOW_MS - 1);
    undo();
    await vi.advanceTimersByTimeAsync(UNDO_WINDOW_MS);
    expect(deleteTrip).not.toHaveBeenCalled();
    expect(isTripDeletionPending("a")).toBe(false);
  });

  it("reports a failed deletion", async () => {
    deleteTrip.mockRejectedValue(new Error("boom"));
    schedule();
    await vi.advanceTimersByTimeAsync(UNDO_WINDOW_MS);
    expect(onFailed).toHaveBeenCalledOnce();
    expect(onDeleted).not.toHaveBeenCalled();
  });
});
