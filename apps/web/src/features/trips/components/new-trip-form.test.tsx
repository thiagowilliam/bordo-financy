import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import { NewTripForm } from "./new-trip-form";

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
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderForm() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <NewTripForm />
    </QueryClientProvider>,
  );
}

async function pickDate(label: string, day: RegExp) {
  await userEvent.click(screen.getByRole("button", { name: label }));
  await userEvent.click(screen.getByRole("button", { name: day }));
}

async function fillValidForm() {
  await userEvent.type(screen.getByLabelText("Nome da viagem"), "  Santorini & Mykonos ");
  await userEvent.type(screen.getByLabelText("Destino"), "Grécia");
  await pickDate("Data de ida", /10 de/);
  await userEvent.type(screen.getByLabelText("Orçamento total"), "540000");
}

describe("NewTripForm", () => {
  it("shows pt-BR messages under each field on an empty submit", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Criar viagem" }));
    expect(await screen.findByText("Informe o nome da viagem")).toBeInTheDocument();
    expect(screen.getByText("Informe o destino")).toBeInTheDocument();
    expect(screen.getByText("Informe a data de ida")).toBeInTheDocument();
    expect(screen.getByText("Informe a data de volta")).toBeInTheDocument();
    expect(screen.getByText("Informe um orçamento maior que zero")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome da viagem")).toBeInvalid();
    expect(screen.getByLabelText("Nome da viagem")).toHaveAccessibleDescription(
      "Informe o nome da viagem",
    );
    expect(push).not.toHaveBeenCalled();
  });

  it("clears an error once the field is fixed after the first submit", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Criar viagem" }));
    await screen.findByText("Informe o destino");
    await userEvent.type(screen.getByLabelText("Destino"), "G");
    await waitFor(() => expect(screen.queryByText("Informe o destino")).not.toBeInTheDocument());
  });

  it("does not offer return dates before the departure", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Data de ida" }));
    const day = screen.getAllByRole("button", { name: /20 de/ })[0];
    await userEvent.click(day);
    await userEvent.click(screen.getByRole("button", { name: "Data de volta" }));
    expect(screen.getByRole("button", { name: /19 de/ })).toBeDisabled();
  });

  it("clears the return date when the departure moves after it", async () => {
    renderForm();
    await userEvent.click(screen.getByRole("button", { name: "Data de ida" }));
    await userEvent.click(screen.getByRole("button", { name: /10 de/ }));
    await userEvent.click(screen.getByRole("button", { name: "Data de volta" }));
    await userEvent.click(screen.getByRole("button", { name: /12 de/ }));
    expect(screen.getByRole("button", { name: "Data de volta" })).not.toHaveTextContent(
      "dd/mm/aaaa",
    );
    await userEvent.click(screen.getByRole("button", { name: "Data de ida" }));
    await userEvent.click(screen.getByRole("button", { name: /20 de/ }));
    expect(screen.getByRole("button", { name: "Data de volta" })).toHaveTextContent("dd/mm/aaaa");
  });

  it("creates the trip with the budget in minor units, toasts and goes back to the list", async () => {
    let body: unknown;
    server.use(
      http.post("*/api/trips", async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(
          { id: "trip-new", coverPhotoUrl: null, ...(body as object) },
          { status: 201 },
        );
      }),
    );
    renderForm();
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "Data de volta" }));
    await userEvent.click(screen.getByRole("button", { name: /15 de/ }));
    await userEvent.click(screen.getByRole("button", { name: "Criar viagem" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/viagens"));
    expect(toastSuccess).toHaveBeenCalledWith("Viagem criada");
    expect(body).toMatchObject({
      name: "Santorini & Mykonos",
      destination: "Grécia",
      currency: "BRL",
      budgetInCents: 540000,
    });
    expect(body).toEqual(
      expect.objectContaining({
        startDate: expect.stringMatching(/^\d{4}-\d{2}-10$/),
        endDate: expect.stringMatching(/^\d{4}-\d{2}-15$/),
      }),
    );
  });

  it("shows an error toast and stays on the page when the request fails", async () => {
    server.use(http.post("*/api/trips", () => new HttpResponse(null, { status: 500 })));
    renderForm();
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "Data de volta" }));
    await userEvent.click(screen.getByRole("button", { name: /15 de/ }));
    await userEvent.click(screen.getByRole("button", { name: "Criar viagem" }));
    await waitFor(() =>
      expect(toastError).toHaveBeenCalledWith("Não foi possível criar a viagem. Tente de novo."),
    );
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Criar viagem" })).toBeEnabled();
  });

  it("disables the submit button while creating", async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => (release = resolve));
    server.use(
      http.post("*/api/trips", async () => {
        await gate;
        return HttpResponse.json({}, { status: 500 });
      }),
    );
    renderForm();
    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "Data de volta" }));
    await userEvent.click(screen.getByRole("button", { name: /15 de/ }));
    await userEvent.click(screen.getByRole("button", { name: "Criar viagem" }));
    const pending = await screen.findByRole("button", { name: "Criando..." });
    expect(pending).toBeDisabled();
    release();
    await waitFor(() => expect(toastError).toHaveBeenCalled());
  });

  it("keeps the typed digits when the currency changes", async () => {
    renderForm();
    await userEvent.type(screen.getByLabelText("Orçamento total"), "540000");
    expect(screen.getByLabelText("Orçamento total")).toHaveValue("R$ 5.400,00".replace(" ", " "));
    await userEvent.click(screen.getByRole("combobox"));
    await userEvent.click(screen.getByRole("option", { name: "JPY · Iene (¥)" }));
    expect(
      (screen.getByLabelText("Orçamento total") as HTMLInputElement).value.replace(/\s/g, " "),
    ).toBe("¥ 540.000");
  });
});
