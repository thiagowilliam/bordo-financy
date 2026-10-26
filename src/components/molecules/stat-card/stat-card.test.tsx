import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatCard } from "./stat-card";

describe("StatCard", () => {
  it("renders label, formatted value and description", () => {
    render(
      <StatCard
        icon={<svg data-testid="icon" />}
        label="Custos de base"
        valueInCents={260490}
        currency="EUR"
        description="Voos, hospedagem e seguro"
      />,
    );
    expect(screen.getByText("Custos de base")).toBeInTheDocument();
    expect(screen.getByText("€ 2.604,90")).toBeInTheDocument();
    expect(screen.getByText("Voos, hospedagem e seguro")).toBeInTheDocument();
  });

  it("shows the compact description below md and the full one from md", () => {
    render(
      <StatCard
        icon={<svg />}
        label="Custos de base"
        valueInCents={100}
        currency="EUR"
        description="Descrição longa"
        compactDescription="Curta"
      />,
    );
    expect(screen.getByText("Curta")).toHaveClass("md:hidden");
    expect(screen.getByText("Descrição longa")).toHaveClass("hidden", "md:block");
  });

  it("hides the decorative icon from assistive tech", () => {
    render(
      <StatCard
        icon={<svg data-testid="icon" />}
        label="Dia a dia"
        valueInCents={101640}
        currency="EUR"
        description="x"
      />,
    );
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });
});
