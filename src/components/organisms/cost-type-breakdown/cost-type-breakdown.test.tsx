import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CostTypeBreakdown, type CostTypeBreakdownProps } from "./cost-type-breakdown";

const base: CostTypeBreakdownProps = {
  currency: "EUR",
  items: [
    { id: "a", name: "Passagem", color: 1, amountInCents: 118640 },
    { id: "b", name: "Seguro viagem", color: 4, amountInCents: 59320 },
  ],
};

describe("CostTypeBreakdown", () => {
  it("renders the title, names and amounts", () => {
    render(<CostTypeBreakdown {...base} />);
    expect(screen.getByRole("heading", { name: "Por tipo de custo" })).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("€ 1.186,40")).toBeInTheDocument();
    expect(screen.getByText("€ 593,20")).toBeInTheDocument();
  });

  it("scales bars to the largest type", () => {
    render(<CostTypeBreakdown {...base} />);
    expect(
      screen.getByRole("progressbar", { name: "Passagem nos custos de base" }),
    ).toHaveAttribute("aria-valuenow", "100");
    expect(
      screen.getByRole("progressbar", { name: "Seguro viagem nos custos de base" }),
    ).toHaveAttribute("aria-valuenow", "50");
  });

  it("shows the empty state", () => {
    render(<CostTypeBreakdown {...base} items={[]} />);
    expect(screen.getByText("Nenhum custo de base cadastrado")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
