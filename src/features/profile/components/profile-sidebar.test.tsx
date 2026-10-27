import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import { server } from "@/mocks/server";

import { ProfileMobileTopBar, ProfileSidebar } from "./profile-sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/perfil" }));

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const fallbackUser = { name: "Fulana", email: "fulana@email.com" };

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("ProfileSidebar", () => {
  it("shows the fallback user first and then the loaded profile", async () => {
    renderWithClient(<ProfileSidebar fallbackUser={fallbackUser} />);
    expect(screen.getByText("Fulana")).toBeInTheDocument();
    expect(await screen.findByText("Marina Duarte")).toBeInTheDocument();
    expect(screen.getByText("marina@email.com")).toBeInTheDocument();
  });
});

describe("ProfileMobileTopBar", () => {
  it("renders the top bar with the user's initial", async () => {
    renderWithClient(<ProfileMobileTopBar fallbackName="Fulana" />);
    expect(screen.getByText("F")).toBeInTheDocument();
    expect(await screen.findByText("M")).toBeInTheDocument();
  });
});
