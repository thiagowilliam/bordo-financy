import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HttpResponse, http } from "msw";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { profileFixture } from "@/mocks/fixtures/profile";
import { server } from "@/mocks/server";

import { fetchProfile } from "../api/client";
import { OnboardingScreen } from "./onboarding-screen";

// jsdom cannot handle the long srcset selector that `priority` makes React preload.
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element -- test double for next/image
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}));

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => {
  server.resetHandlers();
  push.mockClear();
});
afterAll(() => server.close());

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <OnboardingScreen />
    </QueryClientProvider>,
  );
}

const withoutGoogle = () =>
  server.use(
    http.get("/api/profile", () => HttpResponse.json({ ...profileFixture, googleEmail: null })),
  );

describe("OnboardingScreen", () => {
  it("welcomes the user and shows the step", async () => {
    withoutGoogle();
    renderScreen();
    expect(screen.getByRole("heading", { name: "Que bom ter você a bordo!" })).toBeInTheDocument();
    expect(screen.getByText("Passo 1 de 2 · Leva menos de um minuto")).toBeInTheDocument();
    expect(await screen.findByLabelText("Como podemos te chamar?")).toHaveValue("Marina Duarte");
    expect(screen.getByText("Usaremos esse nome para te cumprimentar no app.")).toBeInTheDocument();
    expect(screen.queryByText("Foto da sua conta Google")).not.toBeInTheDocument();
  });

  it("shows what came from the Google account", async () => {
    renderScreen();
    expect(await screen.findByText("Foto da sua conta Google")).toBeInTheDocument();
    expect(screen.getByText("marina@gmail.com")).toBeInTheDocument();
    expect(screen.getByText(/Pegamos essas informações da sua conta Google/)).toBeInTheDocument();
  });

  it("requires a name", async () => {
    withoutGoogle();
    renderScreen();
    const field = await screen.findByLabelText("Como podemos te chamar?");
    await userEvent.clear(field);
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));
    expect(await screen.findByText("Informe seu nome")).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it("saves the name and goes to the first trip", async () => {
    withoutGoogle();
    renderScreen();
    const field = await screen.findByLabelText("Como podemos te chamar?");
    await userEvent.clear(field);
    await userEvent.type(field, "Marina");
    await userEvent.click(screen.getByRole("button", { name: "Continuar" }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/viagens/nova"));
    server.resetHandlers();
    expect((await fetchProfile()).name).toBe("Marina");
  });
});
