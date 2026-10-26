import { render, screen } from "@testing-library/react";
import { CirclePlus, Luggage } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SidebarNav } from "./sidebar-nav";

const pathname = vi.hoisted(() => ({ current: "/viagens" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

const items = [
  { href: "/viagens", label: "Minhas viagens", icon: <Luggage /> },
  { href: "/viagens/nova", label: "Nova viagem", icon: <CirclePlus /> },
] as const;

function current() {
  return screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "page")
    .map((link) => link.textContent);
}

describe("SidebarNav", () => {
  beforeEach(() => {
    pathname.current = "/viagens";
  });

  it("renders a labelled nav with a link per item", () => {
    render(<SidebarNav items={[...items]} />);
    expect(screen.getByRole("navigation", { name: "Navegação principal" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Nova viagem" })).toHaveAttribute(
      "href",
      "/viagens/nova",
    );
  });

  it("activates Minhas viagens on /viagens", () => {
    render(<SidebarNav items={[...items]} />);
    expect(current()).toEqual(["Minhas viagens"]);
  });

  it("activates Minhas viagens on a trip route", () => {
    pathname.current = "/viagens/trip-1/dia-a-dia";
    render(<SidebarNav items={[...items]} />);
    expect(current()).toEqual(["Minhas viagens"]);
  });

  it("activates only Nova viagem on /viagens/nova", () => {
    pathname.current = "/viagens/nova";
    render(<SidebarNav items={[...items]} />);
    expect(current()).toEqual(["Nova viagem"]);
  });

  it("does not prefix-match exact items", () => {
    pathname.current = "/viagens/trip-1/dia-a-dia";
    const exactItems = [{ ...items[0], exact: true }, items[1]];
    render(<SidebarNav items={exactItems} />);
    expect(current()).toEqual([]);
  });

  it("still matches an exact item on its own path", () => {
    render(<SidebarNav items={[{ ...items[0], exact: true }]} />);
    expect(current()).toEqual(["Minhas viagens"]);
  });

  it("accepts an aria-label override", () => {
    render(<SidebarNav items={[...items]} aria-label="Navegação da viagem" />);
    expect(screen.getByRole("navigation", { name: "Navegação da viagem" })).toBeInTheDocument();
  });
});
