import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ProgressBar } from "./progress-bar";

describe("ProgressBar", () => {
  it("exposes the percentage to assistive tech", () => {
    render(<ProgressBar progress={0.724} aria-label="Orçamento usado" />);
    const bar = screen.getByRole("progressbar", { name: "Orçamento usado" });
    expect(bar).toHaveAttribute("aria-valuenow", "72");
    expect(bar.firstElementChild).toHaveStyle({ width: "72%" });
  });

  it("caps the value at 100", () => {
    render(<ProgressBar progress={1.8} status="over" aria-label="Orçamento usado" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "100");
    expect(bar.firstElementChild).toHaveClass("bg-destructive");
  });

  it.each([
    ["ok", "bg-success"],
    ["warning", "bg-warning"],
  ] as const)("colors the %s status", (status, token) => {
    render(<ProgressBar progress={0.5} status={status} aria-label="x" />);
    expect(screen.getByRole("progressbar").firstElementChild).toHaveClass(token);
  });
});
