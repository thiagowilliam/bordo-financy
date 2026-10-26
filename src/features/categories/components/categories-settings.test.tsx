import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { server } from "@/mocks/server";

import { fetchCategories } from "../api/client";
import { CategoriesSettings } from "./categories-settings";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderSettings() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <CategoriesSettings today="2026-10-22" />
    </QueryClientProvider>,
  );
}

const rowOf = async (name: string) => {
  const heading = await screen.findByText(name, { selector: "span, p, h3" });
  return within(heading.closest("li") as HTMLElement);
};

describe("CategoriesSettings", () => {
  it("shows a busy region while loading", () => {
    renderSettings();
    expect(screen.getByRole("status", { busy: true })).toBeInTheDocument();
  });

  it("lists daily categories with badges and usage, then the base ones", async () => {
    renderSettings();
    const food = await rowOf("Alimentação");
    expect(food.getByText("Padrão")).toBeInTheDocument();
    await waitFor(() => expect(food.getAllByText(/lançamentos/).length).toBeGreaterThan(0));
    expect(food.getByRole("button", { name: "Ocultar categoria" })).toBeInTheDocument();
    expect(food.queryByRole("button", { name: "Excluir categoria" })).not.toBeInTheDocument();

    const fuel = await rowOf("Combustível");
    expect(fuel.queryByText("Padrão")).not.toBeInTheDocument();
    expect(fuel.getByRole("button", { name: "Excluir categoria" })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: "Custos de base" }));
    expect(await screen.findByText("Hospedagem")).toBeInTheDocument();
    expect(screen.queryByText("Alimentação")).not.toBeInTheDocument();
  });

  it("hides a default category and shows it again", async () => {
    renderSettings();
    const row = await rowOf("Compras");
    await userEvent.click(row.getByRole("button", { name: "Ocultar categoria" }));
    await waitFor(async () =>
      expect((await fetchCategories()).find((c) => c.id === "cat-compras")?.hidden).toBe(true),
    );
    expect(await (await rowOf("Compras")).findByText("Oculta")).toBeInTheDocument();

    await userEvent.click(
      (await rowOf("Compras")).getByRole("button", { name: "Mostrar categoria" }),
    );
    await waitFor(async () =>
      expect((await fetchCategories()).find((c) => c.id === "cat-compras")?.hidden).toBe(false),
    );
  });

  it("creates a category of the selected kind", async () => {
    renderSettings();
    await userEvent.click(await screen.findByRole("button", { name: /Nova categoria/ }));
    await userEvent.type(await screen.findByLabelText("Nome"), "Farmácia");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    await waitFor(async () =>
      expect(await fetchCategories()).toContainEqual(
        expect.objectContaining({ name: "Farmácia", kind: "DAILY", isDefault: false }),
      ),
    );
    expect(await screen.findByText("Farmácia")).toBeInTheDocument();
  });

  it("edits the name of a category", async () => {
    renderSettings();
    const row = await rowOf("Passeios");
    await userEvent.click(row.getByRole("button", { name: "Editar categoria" }));
    const name = await screen.findByLabelText("Nome");
    await userEvent.clear(name);
    await userEvent.type(name, "Passeios e tours");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

    expect(await screen.findByText("Passeios e tours")).toBeInTheDocument();
  });

  it("moves the expenses of a category in use to another one when deleting it", async () => {
    renderSettings();
    const row = await rowOf("Combustível");
    await userEvent.click(row.getByRole("button", { name: "Excluir categoria" }));
    expect(await screen.findByText(/usam esta categoria/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Mover e excluir/ }));

    await waitFor(async () =>
      expect((await fetchCategories()).some((c) => c.id === "cat-combustivel")).toBe(false),
    );
  });

  it("explains when loading fails", async () => {
    server.use(http.get("/api/categories", () => new HttpResponse(null, { status: 500 })));
    renderSettings();
    expect(await screen.findByText("Não foi possível carregar as categorias.")).toBeInTheDocument();
  });
});
