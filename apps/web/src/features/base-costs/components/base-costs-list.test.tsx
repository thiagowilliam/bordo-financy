import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { LISBON_TRIP_ID } from "@/mocks/fixtures/trips";
import { server } from "@/mocks/server";

import { BaseCostsList } from "./base-costs-list";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderList(tripId: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <BaseCostsList tripId={tripId} />
    </QueryClientProvider>,
  );
}

describe("BaseCostsList", () => {
  it("shows a busy region while loading", () => {
    renderList(LISBON_TRIP_ID);
    expect(screen.getByRole("status", { busy: true })).toBeInTheDocument();
  });

  it("shows the total, the groups and the items", async () => {
    renderList(LISBON_TRIP_ID);
    expect(await screen.findByText("Total em custos de base")).toBeInTheDocument();
    expect(screen.getAllByText(/2\.604,90/).length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Hospedagem", level: 3 })).toBeInTheDocument();
    expect(screen.getAllByText(/^Pago em \d{2} \w{3}$/).length).toBeGreaterThan(0);
    expect(screen.getByText("Por tipo de custo")).toBeInTheDocument();
  });

  it("shows the empty state for a trip without base costs", async () => {
    server.use(http.get("/api/trips/:tripId/base-costs", () => HttpResponse.json([])));
    renderList(LISBON_TRIP_ID);
    expect(await screen.findByText("Nenhum custo de base ainda")).toBeInTheDocument();
  });
});
