import { fireEvent, render, screen } from "@testing-library/react";
import { Camera, CalendarDays, LayoutDashboard, Wallet } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { TripTabBar } from "./trip-tab-bar";

vi.mock("next/navigation", () => ({ usePathname: () => "/viagens/t1/dia-a-dia" }));

const items = [
  { href: "/viagens/t1" as never, label: "Visão geral", icon: <LayoutDashboard /> },
  { href: "/viagens/t1/custos-base" as never, label: "Custos de base", icon: <Wallet /> },
  { href: "/viagens/t1/dia-a-dia" as never, label: "Dia a dia", icon: <CalendarDays /> },
  { href: "/viagens/t1/fotos" as never, label: "Fotos", icon: <Camera /> },
];

describe("TripTabBar", () => {
  it("renders a labelled nav with four links", () => {
    render(<TripTabBar items={items} onLaunch={() => {}} />);
    const nav = screen.getByRole("navigation", { name: "Navegação da viagem" });
    expect(nav.querySelectorAll("a")).toHaveLength(4);
  });

  it("marks only the matching item as current", () => {
    render(<TripTabBar items={items} onLaunch={() => {}} />);
    const current = screen
      .getAllByRole("link")
      .filter((link) => link.getAttribute("aria-current") === "page");
    expect(current.map((link) => link.textContent)).toEqual(["Dia a dia"]);
  });

  it("places the launch button after the second item and calls onLaunch", () => {
    const onLaunch = vi.fn();
    render(<TripTabBar items={items} onLaunch={onLaunch} />);
    const button = screen.getByRole("button", { name: "Lançar gasto" });
    expect(button.previousElementSibling).toBe(
      screen.getByRole("link", { name: "Custos de base" }),
    );
    fireEvent.click(button);
    expect(onLaunch).toHaveBeenCalledOnce();
  });
});
