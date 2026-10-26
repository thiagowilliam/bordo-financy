import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { fetchExpenses } from "@/features/expenses/api/client";
import { LISBON_TRIP_ID } from "@/mocks/fixtures/trips";
import { server } from "@/mocks/server";
import { useExpenseDrawerStore } from "@/stores/expense-drawer";

import { ExpenseDrawer } from "./expense-drawer";

vi.mock("next/navigation", () => ({
  useParams: () => ({ tripId: LISBON_TRIP_ID }),
}));

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
beforeEach(() => useExpenseDrawerStore.setState({ isOpen: false, mode: "DAILY", editingId: null }));

function renderDrawer() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ExpenseDrawer />
    </QueryClientProvider>,
  );
}

describe("ExpenseDrawer", () => {
  it("stays closed until the store opens it", async () => {
    renderDrawer();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    useExpenseDrawerStore.getState().open();
    expect(await screen.findByRole("dialog", { name: "Lançar gasto" })).toBeInTheDocument();
  });

  it("opens in the base cost mode", async () => {
    renderDrawer();
    useExpenseDrawerStore.getState().open("BASE");
    expect(
      await screen.findByRole("radio", { name: "Custo de base", checked: true }),
    ).toBeVisible();
    expect(screen.getByText("Data de pagamento")).toBeInTheDocument();
    expect(screen.getByText("Gerenciar tipos de custo")).toBeInTheDocument();
  });

  it("asks for the missing fields", async () => {
    renderDrawer();
    useExpenseDrawerStore.getState().open();
    await userEvent.click(await screen.findByRole("button", { name: /Salvar gasto/ }));
    expect(await screen.findByText("Informe um valor maior que zero")).toBeInTheDocument();
    expect(screen.getByText("Selecione a categoria")).toBeInTheDocument();
    expect(screen.getByText("Selecione a forma de pagamento")).toBeInTheDocument();
  });

  it("creates an expense and closes", async () => {
    const before = (await fetchExpenses(LISBON_TRIP_ID)).length;
    renderDrawer();
    useExpenseDrawerStore.getState().open();

    await userEvent.type(await screen.findByLabelText("Valor"), "1850");
    await userEvent.click(screen.getByRole("button", { name: /^Categoria/ }));
    await userEvent.click(await screen.findByRole("option", { name: /Alimentação/ }));
    await userEvent.click(screen.getByRole("button", { name: /^Forma de pagamento/ }));
    await userEvent.click(await screen.findByRole("radio", { name: /Crédito/ }));
    await userEvent.type(screen.getByLabelText("Descrição (opcional)"), "Café de teste");
    await userEvent.click(screen.getByRole("button", { name: /Salvar gasto/ }));

    await waitFor(async () => expect(await fetchExpenses(LISBON_TRIP_ID)).toHaveLength(before + 1));
    await waitFor(() => expect(useExpenseDrawerStore.getState().isOpen).toBe(false));
  });

  it("edits an expense with its current values", async () => {
    const [first] = await fetchExpenses(LISBON_TRIP_ID);
    renderDrawer();
    useExpenseDrawerStore.getState().edit(first.id, "DAILY");
    expect(await screen.findByRole("dialog", { name: "Editar lançamento" })).toBeInTheDocument();
    expect(screen.getByLabelText("Valor")).toHaveValue(
      (first.amountInCents / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 }),
    );
    expect(screen.getByRole("button", { name: "Excluir lançamento" })).toBeInTheDocument();
  });
});
