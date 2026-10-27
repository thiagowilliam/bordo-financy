import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { fetchExpenses } from "../api/client";
import { useExpenseDrawerStore } from "@/stores/expense-drawer";
import { LISBON_TRIP_ID } from "@/mocks/fixtures/trips";
import { server } from "@/mocks/server";

import { DailyList } from "./daily-list";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderList(tripId = LISBON_TRIP_ID, searchParams = "") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = withNuqsTestingAdapter({ searchParams, hasMemory: true });
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
    await waitFor(() => expect(screen.queryByText("Pastéis de nata")).not.toBeInTheDocument(), {
      timeout: 4000,
    });

    await userEvent.click(screen.getByRole("button", { name: /Limpar filtros/ }));
    expect(await screen.findAllByText(/Dia \d+ · \d+ out/)).not.toHaveLength(0);
    await waitFor(
      () => expect(screen.queryByText("Categoria: Saúde e outros")).not.toBeInTheDocument(),
      { timeout: 4000 },
    );
  });

  it("explains when no expense matches the filters", async () => {
    renderList(LISBON_TRIP_ID, "?q=zzzz-nada");
    expect(await screen.findByText("Nenhum lançamento encontrado")).toBeInTheDocument();
  });

  it("shows the empty state for a trip without expenses", async () => {
    renderList("trip-kyoto-osaka");
    expect(await screen.findByText("Nenhum gasto lançado ainda")).toBeInTheDocument();
  });

  it("opens the drawer to edit a row", async () => {
    renderList();
    const [row] = await screen.findAllByRole("button", { name: /^Editar lançamento: / });
    await userEvent.click(row);
    expect(useExpenseDrawerStore.getState()).toMatchObject({ isOpen: true });
    expect(useExpenseDrawerStore.getState().editingId).not.toBeNull();
  });

  it("deletes a row after confirming", async () => {
    const before = (await fetchExpenses(LISBON_TRIP_ID)).length;
    renderList();
    const [remove] = await screen.findAllByRole("button", { name: "Excluir lançamento" });
    await userEvent.click(remove);
    await userEvent.click(await screen.findByRole("button", { name: "Excluir" }));
    await waitFor(async () => expect(await fetchExpenses(LISBON_TRIP_ID)).toHaveLength(before - 1));
  });
});
