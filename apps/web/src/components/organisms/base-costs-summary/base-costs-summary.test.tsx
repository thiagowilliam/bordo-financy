import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BaseCostsSummary, type BaseCostsSummaryProps } from "./base-costs-summary";

const base: BaseCostsSummaryProps = {
  totalInCents: 260490,
  budgetInCents: 500000,
  currency: "EUR",
  itemCount: 10,
  typeCount: 7,
};

describe("BaseCostsSummary", () => {
  it("shows total, budget percentage and counts", () => {
    render(<BaseCostsSummary {...base} />);
    expect(screen.getByText("€ 2.604,90")).toBeInTheDocument();
    expect(screen.getByText("52%")).toBeInTheDocument();
    expect(screen.getByText("de € 5.000,00")).toBeInTheDocument();
    expect(screen.getByText("de € 5.000")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("em 7 tipos")).toBeInTheDocument();
  });

  it("uses singular type label", () => {
    render(<BaseCostsSummary {...base} typeCount={1} itemCount={1} />);
    expect(screen.getByText("em 1 tipo")).toBeInTheDocument();
  });

  it("renders the action slot", () => {
    render(<BaseCostsSummary {...base} action={<button>Adicionar custo</button>} />);
    expect(screen.getByRole("button", { name: "Adicionar custo" })).toBeInTheDocument();
  });

  it("handles a zero budget", () => {
    render(<BaseCostsSummary {...base} budgetInCents={0} />);
    expect(screen.queryByText("52%")).not.toBeInTheDocument();
  });
});
