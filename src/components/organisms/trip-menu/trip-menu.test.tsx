import { render, screen } from "@testing-library/react";
import { Camera, LayoutDashboard } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { TripMenu, TripMenuSkeleton } from "./trip-menu";

vi.mock("next/navigation", () => ({ usePathname: () => "/viagens/t1/dia-a-dia" }));

const items = [
  { href: "/viagens/t1" as never, label: "Visão geral", icon: <LayoutDashboard /> },
  { href: "/viagens/t1/dia-a-dia" as never, label: "Dia a dia", icon: <Camera /> },
];

describe("TripMenu", () => {
  it("renders the label, trip identity and a labelled nav", () => {
    render(<TripMenu tripName="Lisboa" period="12 – 26 out" coverPhotoUrl={null} items={items} />);
    expect(screen.getByText("Viagem aberta")).toBeInTheDocument();
    expect(screen.getByText("Lisboa")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Navegação da viagem" });
    expect(nav.querySelectorAll("a")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Dia a dia" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Visão geral" })).not.toHaveAttribute("aria-current");
  });

  it("renders a busy skeleton", () => {
    render(<TripMenuSkeleton />);
    expect(screen.getByLabelText("Carregando viagem")).toHaveAttribute("aria-busy", "true");
  });
});
