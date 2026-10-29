import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import { TripsOverview } from "./trips-overview";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderOverview() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TripsOverview today="2026-10-22" />
    </QueryClientProvider>,
  );
}

describe("TripsOverview", () => {
  it("shows a busy region while loading", () => {
    renderOverview();
    expect(screen.getByRole("status", { busy: true })).toBeInTheDocument();
  });

  it("groups trips by phase", async () => {
    renderOverview();
    expect(await screen.findByRole("heading", { name: "Em andamento" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Próximas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Concluídas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Nova viagem/ })).toHaveAttribute(
      "href",
      "/viagens/nova",
    );

    const upcoming = within(screen.getByRole("region", { name: "Próximas" }));
    const names = upcoming.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(names).toEqual(["Patagônia", "Kyoto & Osaka"]);

    const completed = within(screen.getByRole("region", { name: "Concluídas" }));
    expect(completed.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Costa Amalfitana",
      "Bali",
    ]);
  });

  it("renders the ongoing Lisboa card", async () => {
    renderOverview();
    const link = await screen.findByRole("link", { name: /Lisboa & Sintra/ });
    const card = within(link);
    expect(link).toHaveAttribute("href", "/viagens/trip-lisboa-sintra");
    expect(card.getByText("Dia 11 de 15")).toBeInTheDocument();
    expect(card.getByText("72% usado")).toBeInTheDocument();
    expect(card.getByText("€ 3.621,30")).toBeInTheDocument();
    expect(card.getByText("Portugal · 12 – 26 out")).toBeInTheDocument();
  });

  it("shows the overspend on the Bali card", async () => {
    renderOverview();
    const link = await screen.findByRole("link", { name: /Bali/ });
    expect(within(link).getByText("acima", { exact: false })).toBeInTheDocument();
  });

  it("shows the empty state and hides the header action", async () => {
    server.use(http.get("*/api/trips", () => HttpResponse.json([])));
    renderOverview();
    expect(
      await screen.findByRole("heading", { name: "Sua primeira viagem começa aqui" }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("Olá, Marina. Suas viagens vão aparecer aqui."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Nova viagem" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Criar primeira viagem/ })).toBeInTheDocument();
  });

  it("offers a retry when the request fails", async () => {
    server.use(http.get("*/api/trips", () => new HttpResponse(null, { status: 500 })));
    renderOverview();
    expect(await screen.findByText("Não foi possível carregar suas viagens.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeInTheDocument();
  });
});
