import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Sidebar } from "./sidebar";

const pathname = vi.hoisted(() => ({ current: "/viagens" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

describe("Sidebar", () => {
  beforeEach(() => {
    pathname.current = "/viagens";
  });

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

  it("renders the trip menu slot below the global menu", () => {
    render(
      <Sidebar
        user={{ name: "Marina", email: "marina@email.com" }}
        tripMenu={<p>Viagem aberta</p>}
      />,
    );
    expect(screen.getByText("Viagem aberta")).toBeInTheDocument();
  });

  it("keeps Minhas viagens inactive on a trip route", () => {
    pathname.current = "/viagens/t1/dia-a-dia";
    render(<Sidebar user={{ name: "Marina", email: "marina@email.com" }} />);
    expect(screen.getByRole("link", { name: "Minhas viagens" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
