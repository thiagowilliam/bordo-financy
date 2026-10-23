import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Breadcrumb, type BreadcrumbItem } from "./breadcrumb";

const items: BreadcrumbItem[] = [
  { label: "Minhas viagens", href: "/viagens" },
  { label: "Nova viagem" },
];

describe("Breadcrumb", () => {
  it("links the parents and marks the last item as the current page", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("navigation", { name: "Trilha de navegação" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Minhas viagens" })).toHaveAttribute(
      "href",
      "/viagens",
    );
    expect(screen.getByText("Nova viagem")).toHaveAttribute("aria-current", "page");
    expect(screen.queryByRole("link", { name: "Nova viagem" })).not.toBeInTheDocument();
  });
});
