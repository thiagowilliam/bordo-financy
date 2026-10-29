import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { LISBON_TRIP_ID } from "@/mocks/fixtures/trips";
import { db } from "@/mocks/handlers/db";
import { server } from "@/mocks/server";

import { EditTripForm } from "./edit-trip-form";

const push = vi.fn();
const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  server.resetHandlers();
  push.mockReset();
  toastSuccess.mockReset();
});
afterAll(() => server.close());

function renderForm(today = "2026-10-22") {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <EditTripForm tripId={LISBON_TRIP_ID} today={today} />
    </QueryClientProvider>,
  );
}

describe("EditTripForm", () => {
  it("fills the fields and keeps save disabled while nothing changed", async () => {
    renderForm();
    expect(await screen.findByLabelText("Nome da viagem")).toHaveValue("Lisboa & Sintra");
    expect(screen.getByLabelText("Destino")).toHaveValue("Portugal");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Nome da viagem"), "!");
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeEnabled();
  });

  it("locks the currency because the trip has expenses", async () => {
    renderForm();
    await screen.findByLabelText("Nome da viagem");
    expect(screen.getByLabelText("Moeda da viagem")).toBeDisabled();
    expect(
      screen.getByText("A moeda não pode ser alterada depois que a viagem tem gastos."),
    ).toBeInTheDocument();
  });

  it("warns, without blocking, when the budget is below what was spent", async () => {
    renderForm();
    const budget = await screen.findByLabelText("Orçamento total");
    await userEvent.clear(budget);
    await userEvent.type(budget, "1000");
    expect(screen.getByText(/O orçamento ficará abaixo dos .* já gastos\./)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar alterações" })).toBeEnabled();
  });

  it("saves, records the budget change and goes back to the trip", async () => {
    renderForm();
    const budget = await screen.findByLabelText("Orçamento total");
    await userEvent.clear(budget);
    await userEvent.type(budget, "600000");
    await userEvent.click(screen.getByRole("button", { name: "Salvar alterações" }));

    await waitFor(() => expect(toastSuccess).toHaveBeenCalledWith("Viagem atualizada"));
    expect(push).toHaveBeenCalledWith(`/viagens/${LISBON_TRIP_ID}`);
    expect(db.budgetChanges[LISBON_TRIP_ID]).toMatchObject({
      fromInCents: 500000,
      toInCents: 600000,
    });
  });
});
