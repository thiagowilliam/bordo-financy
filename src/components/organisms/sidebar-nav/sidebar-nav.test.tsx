import { render, screen } from "@testing-library/react";
import { MapPin, Tags } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { SidebarNav } from "./sidebar-nav";

vi.mock("next/navigation", () => ({ usePathname: () => "/viagens/trip-1/dia-a-dia" }));

const items = [
  { href: "/viagens", label: "Minhas viagens", icon: <MapPin /> },
  { href: "/configuracoes/categorias", label: "Categorias", icon: <Tags /> },
] as const;

describe("SidebarNav", () => {
  it("renders a link per item", () => {
    render(<SidebarNav items={[...items]} />);
    expect(screen.getByRole("link", { name: "Minhas viagens" })).toHaveAttribute(
      "href",
      "/viagens",
    );
    expect(screen.getByRole("link", { name: "Categorias" })).toBeInTheDocument();
  });

  it("marks the current section as active", () => {
    render(<SidebarNav items={[...items]} />);
    expect(screen.getByRole("link", { name: "Minhas viagens" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Categorias" })).not.toHaveAttribute("aria-current");
  });
});
