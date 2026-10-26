import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { LISBON_TRIP_ID } from "@/mocks/fixtures/trips";
import { server } from "@/mocks/server";

import { DailyList } from "./daily-list";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderList(tripId = LISBON_TRIP_ID, searchParams = "") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = withNuqsTestingAdapter({ searchParams });
  return render(
    <QueryClientProvider client={client}>
      <Wrapper>
        <DailyList tripId={tripId} today="2026-10-22" />
      </Wrapper>
    </QueryClientProvider>,
  );
}

describe("DailyList", () => {
  it("shows a busy region while loading", () => {
    renderList();
    expect(screen.getByRole("status", { busy: true })).toBeInTheDocument();
  });

  it("groups expenses by day, newest first, three days at a time", async () => {
    renderList();
    expect(await screen.findByText("Dia 11 · 22 out")).toBeInTheDocument();
    expect(screen.getByText("Hoje")).toBeInTheDocument();
    expect(screen.getByText("Dia 9 · 20 out")).toBeInTheDocument();
    expect(screen.queryByText("Dia 8 · 19 out")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Ver dias anteriores" }));
    expect(await screen.findByText("Dia 8 · 19 out")).toBeInTheDocument();
  });

  it("filters by the search term stored in the URL", async () => {
    renderList(LISBON_TRIP_ID, "?q=Farm%C3%A1cia");
    expect((await screen.findAllByText("Farmácia")).length).toBeGreaterThan(0);
    expect(screen.queryByText("Pastéis de nata")).not.toBeInTheDocument();
  });

  it("shows the active category filter and lets the user clear it", async () => {
    renderList(LISBON_TRIP_ID, "?categorias=cat-saude");
    expect(await screen.findByText("Categoria: Saúde e outros")).toBeInTheDocument();
    expect(screen.queryByText("Pastéis de nata")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Limpar filtros/ }));
    expect(await screen.findAllByText(/Dia \d+ · \d+ out/)).not.toHaveLength(0);
    expect(screen.queryByText("Categoria: Saúde e outros")).not.toBeInTheDocument();
  });

  it("explains when no expense matches the filters", async () => {
    renderList(LISBON_TRIP_ID, "?q=zzzz-nada");
    expect(await screen.findByText("Nenhum lançamento encontrado")).toBeInTheDocument();
  });

  it("shows the empty state for a trip without expenses", async () => {
    renderList("trip-kyoto-osaka");
    expect(await screen.findByText("Nenhum gasto lançado ainda")).toBeInTheDocument();
  });
});
