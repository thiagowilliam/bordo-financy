import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { server } from "../server";
import { fetchBaseCosts } from "@/features/base-costs/api/client";
import { fetchExpenses } from "@/features/expenses/api/client";
import { createTrip, fetchTrips } from "@/features/trips/api/client";
import { LISBON_TRIP_ID } from "../fixtures/trips";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("msw handlers", () => {
  it("lists trips", async () => {
    const trips = await fetchTrips();
    expect(trips.map((trip) => trip.name)).toContain("Lisboa & Sintra");
    expect(trips.find((trip) => trip.id === LISBON_TRIP_ID)?.spentInCents).toBe(362130);
  });

  it("filters daily expenses by search and category", async () => {
    const all = await fetchExpenses(LISBON_TRIP_ID);
    expect(all).toHaveLength(31);

    const food = await fetchExpenses(LISBON_TRIP_ID, { categories: ["cat-alimentacao"] });
    expect(food.length).toBeGreaterThan(0);
    expect(food.every((expense) => expense.categoryId === "cat-alimentacao")).toBe(true);

    const search = await fetchExpenses(LISBON_TRIP_ID, { search: "pastéis" });
    expect(search.every((expense) => expense.description.includes("Pastéis"))).toBe(true);
  });

  it("lists base costs", async () => {
    expect(await fetchBaseCosts(LISBON_TRIP_ID)).toHaveLength(10);
  });

  it("creates a trip without cover that then shows in the list with nothing spent", async () => {
    const created = await createTrip({
      name: "Santorini",
      destination: "Grécia",
      startDate: "2027-05-01",
      endDate: "2027-05-10",
      budgetInCents: 540000,
      currency: "EUR",
    });
    expect(created.coverPhotoUrl).toBeNull();
    const listed = (await fetchTrips()).find((trip) => trip.id === created.id);
    expect(listed).toMatchObject({ name: "Santorini", spentInCents: 0 });
  });
});
