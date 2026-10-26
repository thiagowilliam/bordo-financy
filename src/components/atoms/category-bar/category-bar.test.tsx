import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryBar } from "./category-bar";

describe("CategoryBar", () => {
  it("exposes the clamped percentage", () => {
    render(<CategoryBar progress={0.456} color={2} aria-label="Hospedagem" />);
    expect(screen.getByRole("progressbar", { name: "Hospedagem" })).toHaveAttribute(
      "aria-valuenow",
      "46",
    );
  });

  it("clamps out of range values", () => {
    render(<CategoryBar progress={3} color={1} aria-label="Max" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });
});
