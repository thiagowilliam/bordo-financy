import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PeriodSummaryCard, type PeriodSummaryCardProps } from "./period-summary-card";

const base: PeriodSummaryCardProps = {
  totalInCents: 142080,
  entryCount: 31,
  averageInCents: 12916,
  dayCount: 11,
  currency: "EUR",
  categories: [
    { id: "food", name: "Alimentação", color: 2, amountInCents: 60000 },
    { id: "tours", name: "Passeios", color: 3, amountInCents: 30000 },
  ],
};

describe("PeriodSummaryCard", () => {
  it("shows totals, counts and average", () => {
    render(<PeriodSummaryCard {...base} />);
    expect(screen.getByRole("heading", { name: "Resumo do período" })).toBeInTheDocument();
    expect(screen.getByText("€ 1.420,80")).toBeInTheDocument();
    expect(screen.getByText("31 lançamentos")).toBeInTheDocument();
    expect(screen.getByText("€ 129,16")).toBeInTheDocument();
    expect(screen.getByText("em 11 dias de viagem")).toBeInTheDocument();
  });

  it("scales category bars to the largest one", () => {
    render(<PeriodSummaryCard {...base} />);
    expect(screen.getByRole("progressbar", { name: "Alimentação no período" })).toHaveAttribute(
      "aria-valuenow",
      "100",
    );
    expect(screen.getByRole("progressbar", { name: "Passeios no período" })).toHaveAttribute(
      "aria-valuenow",
      "50",
    );
  });

  it("uses singular forms", () => {
    render(<PeriodSummaryCard {...base} entryCount={1} dayCount={1} />);
    expect(screen.getByText("1 lançamento")).toBeInTheDocument();
    expect(screen.getByText("em 1 dia de viagem")).toBeInTheDocument();
  });

  it("shows the empty state without categories", () => {
    render(<PeriodSummaryCard {...base} categories={[]} />);
    expect(screen.getByText("Sem lançamentos no período")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
