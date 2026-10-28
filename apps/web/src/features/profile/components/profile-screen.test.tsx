import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { profileFixture } from "@/mocks/fixtures/profile";
import { server } from "@/mocks/server";
import { useUnsavedChangesStore } from "@/stores/unsaved-changes";

import { fetchProfile } from "../api/client";
import { ProfileScreen } from "./profile-screen";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  server.resetHandlers();
  replace.mockClear();
});
afterAll(() => server.close());

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ProfileScreen />
    </QueryClientProvider>,
  );
}

describe("ProfileScreen", () => {
  it("shows a busy region while loading", () => {
    renderScreen();
    expect(screen.getByRole("status", { busy: true })).toBeInTheDocument();
  });

  it("shows the profile and the traveler history", async () => {
    renderScreen();
    expect(await screen.findByRole("heading", { name: "Marina Duarte" })).toBeInTheDocument();
    expect(screen.getByText("No Bordo desde março de 2026")).toBeInTheDocument();
    expect(screen.getByText("64")).toBeInTheDocument();
  });

  it("offers a retry when loading fails", async () => {
    server.use(http.get("/api/profile", () => new HttpResponse(null, { status: 500 })));
    renderScreen();
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível carregar");
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeInTheDocument();
  });

  it("flags unsaved edits for the account menu and clears the flag on leave", async () => {
    const { unmount } = renderScreen();
    const name = await screen.findByLabelText("Nome");
    expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(false);

    await userEvent.type(name, " Lima");
    await waitFor(() => expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(true));

    unmount();
    expect(useUnsavedChangesStore.getState().hasUnsavedChanges).toBe(false);
  });

  it("shows the unsaved bar after an edit and saves it", async () => {
    renderScreen();
    const name = await screen.findByLabelText("Nome");
    expect(screen.queryByRole("region", { name: "Alterações não salvas" })).not.toBeInTheDocument();

    await userEvent.clear(name);
    await userEvent.type(name, "Marina Lima");
    await userEvent.click(await screen.findByRole("button", { name: "Salvar alterações" }));

    await waitFor(async () => expect((await fetchProfile()).name).toBe("Marina Lima"));
    await waitFor(() =>
      expect(
        screen.queryByRole("region", { name: "Alterações não salvas" }),
      ).not.toBeInTheDocument(),
    );
  });

  it("discards the edits", async () => {
    renderScreen();
    const name = await screen.findByLabelText("Nome");
    await userEvent.type(name, "x");
    await userEvent.click(await screen.findByRole("button", { name: "Descartar" }));
    expect(name).toHaveValue((await fetchProfile()).name);
  });

  it("lists the access methods of the account", async () => {
    renderScreen();
    expect(await screen.findByRole("heading", { name: "Métodos de acesso" })).toBeInTheDocument();
    expect(screen.getByText("Conectado como marina@gmail.com")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Alterar senha" })).toBeInTheDocument();
  });

  it("offers to add a password and to connect Google when the account has neither", async () => {
    server.use(
      http.get("/api/profile", () =>
        HttpResponse.json({ ...profileFixture, hasPassword: false, googleEmail: null }),
      ),
    );
    renderScreen();
    expect(await screen.findByRole("button", { name: "Adicionar senha" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Conectar Google" })).toBeInTheDocument();
  });

  it("confirms the password link was sent", async () => {
    renderScreen();
    await userEvent.click(await screen.findByRole("button", { name: "Alterar senha" }));
    expect(
      await screen.findByText("Enviamos um link para marina@email.com criar sua nova senha."),
    ).toBeInTheDocument();
  });

  it("only deletes the account after typing EXCLUIR", async () => {
    renderScreen();
    await userEvent.click(await screen.findByRole("button", { name: "Excluir conta" }));
    await screen.findByRole("dialog");
    const buttons = screen.getAllByRole("button", { name: "Excluir conta" });
    expect(buttons.at(-1)).toBeDisabled();

    await userEvent.type(screen.getByLabelText(/Digite EXCLUIR/), "EXCLUIR");
    expect(buttons.at(-1)).toBeEnabled();
    await userEvent.click(buttons.at(-1)!);
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/"));
  });
});
