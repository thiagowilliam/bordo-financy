import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FilterButton } from "./filter-button";

describe("FilterButton", () => {
  it("renders a button with popup semantics", () => {
    render(<FilterButton icon={<svg />} label="Categoria" />);
    const button = screen.getByRole("button", { name: "Categoria" });
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).not.toHaveAttribute("data-active");
  });

  it("shows the count badge and the active state", () => {
    render(<FilterButton icon={<svg />} label="Categoria" count={2} active />);
    const button = screen.getByRole("button", { name: "Categoria 2" });
    expect(button).toHaveAttribute("data-active", "true");
  });

  it("reflects the open state", () => {
    render(<FilterButton icon={<svg />} label="Período" open />);
    expect(screen.getByRole("button", { name: "Período" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
