import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { server } from "@/mocks/server";
import { LISBON_TRIP_ID } from "@/mocks/fixtures/trips";

import { TripOverview } from "./trip-overview";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderOverview(tripId: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TripOverview tripId={tripId} today="2026-10-22" />
    </QueryClientProvider>,
  );
}

describe("TripOverview", () => {
  it("shows a busy region while loading", () => {
    renderOverview(LISBON_TRIP_ID);
    expect(screen.getByRole("status", { busy: true })).toBeInTheDocument();
  });

  it("shows the trip, totals and latest expenses", async () => {
    renderOverview(LISBON_TRIP_ID);
    expect(await screen.findByRole("heading", { name: "Lisboa & Sintra", level: 1 })).toBeVisible();
    expect(screen.getByText("Em andamento · Dia 11 de 15")).toBeInTheDocument();
    expect(screen.getAllByText(/3\.621,30/).length).toBeGreaterThan(0);
    expect(screen.getByText("Custos de base")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Últimos lançamentos" })).toBeInTheDocument();
  });

  it("shows a not found message for an unknown trip", async () => {
    renderOverview("trip-inexistente");
    expect(await screen.findByText("Viagem não encontrada.")).toBeInTheDocument();
  });
});
