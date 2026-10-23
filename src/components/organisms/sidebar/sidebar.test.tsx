import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Sidebar } from "./sidebar";

vi.mock("next/navigation", () => ({ usePathname: () => "/viagens" }));

describe("Sidebar", () => {
  it("renders logo, the four global items and the user", () => {
    render(<Sidebar user={{ name: "Marina", email: "marina@email.com" }} />);
    expect(screen.getByText("Bordo")).toBeInTheDocument();
    const nav = screen.getByRole("navigation", { name: "Navegação principal" });
    expect(nav.querySelectorAll("a")).toHaveLength(4);
    expect(screen.getByRole("link", { name: "Minhas viagens" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByText("Marina")).toBeInTheDocument();
    expect(screen.getByText("marina@email.com")).toBeInTheDocument();
  });
});
