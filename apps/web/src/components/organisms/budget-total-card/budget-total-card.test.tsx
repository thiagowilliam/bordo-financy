import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BudgetTotalCard, type BudgetTotalCardProps } from "./budget-total-card";

const base: BudgetTotalCardProps = {
  spentInCents: 362130,
  budgetInCents: 500000,
  currency: "EUR",
  tripDays: 15,
};

describe("BudgetTotalCard", () => {
  it("shows total, budget, percent and remaining in pt-BR", () => {
    render(<BudgetTotalCard {...base} />);
    expect(screen.getByText("€ 3.621,30")).toBeInTheDocument();
    expect(screen.getByText("€ 5.000")).toBeInTheDocument();
    expect(screen.getByText("72% usado")).toHaveClass("text-success-ink");
    expect(screen.getByText("€ 1.378,70")).toBeInTheDocument();
    expect(screen.getByText(/restantes/)).toHaveTextContent("15 dias de viagem");
    expect(screen.getByText("Dentro do orçamento")).toBeInTheDocument();
  });

  it("exposes progress to assistive tech", () => {
    render(<BudgetTotalCard {...base} />);
    expect(screen.getByRole("progressbar", { name: "Orçamento usado" })).toHaveAttribute(
      "aria-valuenow",
      "72",
    );
  });

  it("omits the trip days when not provided", () => {
    render(<BudgetTotalCard {...base} tripDays={undefined} />);
    expect(screen.queryByText(/dias de viagem/)).not.toBeInTheDocument();
  });

  it("flags the warning range", () => {
    render(<BudgetTotalCard {...base} spentInCents={420000} />);
    expect(screen.getByText("84% usado")).toHaveClass("text-warning-ink");
    expect(screen.getByText("Perto do limite")).toBeInTheDocument();
  });

  it("shows the excess in destructive ink when over budget", () => {
    render(<BudgetTotalCard {...base} spentInCents={531000} />);
    expect(screen.getByText("106% usado")).toHaveClass("text-destructive-ink");
    expect(screen.getByText("€ 310,00")).toHaveClass("text-destructive-ink");
    expect(
      screen.getByText(/acima do orçamento/, { selector: "span.font-semibold" }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/restantes/)).not.toBeInTheDocument();
  });

  it("renders the budget action and note only when given", () => {
    const { rerender } = render(<BudgetTotalCard {...base} />);
    expect(screen.queryByRole("button", { name: "Ajustar orçamento" })).not.toBeInTheDocument();
    rerender(
      <BudgetTotalCard
        {...base}
        budgetAction={<button type="button" aria-label="Ajustar orçamento" />}
        budgetNote="Orçamento ajustado em 20 out."
      />,
    );
    expect(screen.getByRole("button", { name: "Ajustar orçamento" })).toBeInTheDocument();
    expect(screen.getByText("Orçamento ajustado em 20 out.")).toBeInTheDocument();
  });
});
