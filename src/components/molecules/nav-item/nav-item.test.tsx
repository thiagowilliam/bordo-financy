import { render, screen } from "@testing-library/react";
import { Luggage } from "lucide-react";
import { describe, expect, it } from "vitest";

import { NavItem } from "./nav-item";

describe("NavItem", () => {
  it("renders a link with the label as accessible name", () => {
    render(<NavItem href="/viagens" label="Minhas viagens" icon={<Luggage />} />);
    const link = screen.getByRole("link", { name: "Minhas viagens" });
    expect(link).toHaveAttribute("href", "/viagens");
    expect(link).not.toHaveAttribute("aria-current");
  });

  it("marks the active item with aria-current", () => {
    render(<NavItem href="/viagens" label="Minhas viagens" icon={<Luggage />} active />);
    expect(screen.getByRole("link", { name: "Minhas viagens" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  });
});
