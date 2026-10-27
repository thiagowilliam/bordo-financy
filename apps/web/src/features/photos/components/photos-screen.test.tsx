import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { LISBON_TRIP_ID } from "@/mocks/fixtures/trips";
import { server } from "@/mocks/server";

import { fetchPhotos } from "../api/client";
import { PhotosScreen } from "./photos-screen";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderScreen(tripId = LISBON_TRIP_ID) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <PhotosScreen tripId={tripId} />
    </QueryClientProvider>,
  );
}

describe("PhotosScreen", () => {
  it("shows a busy region while loading", () => {
    renderScreen();
    expect(screen.getByRole("status", { busy: true })).toBeInTheDocument();
  });

  it("shows the gallery with the count and the cover badge", async () => {
    renderScreen();
    expect(await screen.findByRole("list", { name: "Fotos da viagem" })).toBeInTheDocument();
    expect(screen.getByText(/6 fotos da viagem/)).toBeInTheDocument();
    expect(screen.getAllByText("Capa da viagem")).toHaveLength(1);
  });

  it("shows only the add tile for a trip without photos", async () => {
    server.use(http.get("/api/trips/:tripId/photos", () => HttpResponse.json([])));
    renderScreen();
    expect(await screen.findByText(/Adicione fotos da viagem/)).toBeInTheDocument();
    expect(screen.queryByRole("list", { name: "Fotos da viagem" })).not.toBeInTheDocument();
  });

  it("makes another photo the cover", async () => {
    const [, second] = await fetchPhotos(LISBON_TRIP_ID);
    renderScreen();
    const menus = await screen.findAllByRole("button", { name: "Mais opções da foto" });
    await userEvent.click(menus[1]);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Definir como capa" }));

    await waitFor(async () => expect((await fetchPhotos(LISBON_TRIP_ID))[0].id).toBe(second.id));
  });

  it("deletes a photo after confirming", async () => {
    const before = (await fetchPhotos(LISBON_TRIP_ID)).length;
    renderScreen();
    const menus = await screen.findAllByRole("button", { name: "Mais opções da foto" });
    await userEvent.click(menus[1]);
    await userEvent.click(await screen.findByRole("menuitem", { name: "Excluir foto" }));
    await userEvent.click(await screen.findByRole("button", { name: "Excluir" }));

    await waitFor(async () => expect(await fetchPhotos(LISBON_TRIP_ID)).toHaveLength(before - 1));
  });

  it("uploads picked files", async () => {
    const before = (await fetchPhotos(LISBON_TRIP_ID)).length;
    renderScreen();
    await screen.findByRole("list", { name: "Fotos da viagem" });
    const input = screen.getByTestId("photos-header-input");
    await userEvent.upload(input, new File(["x"], "nova.jpg", { type: "image/jpeg" }));

    await waitFor(async () => expect(await fetchPhotos(LISBON_TRIP_ID)).toHaveLength(before + 1));
  });

  it("explains when loading fails", async () => {
    server.use(
      http.get("/api/trips/:tripId/photos", () => new HttpResponse(null, { status: 500 })),
    );
    renderScreen();
    expect(await screen.findByText("Não foi possível carregar as fotos.")).toBeInTheDocument();
  });
});
