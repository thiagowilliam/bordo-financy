import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExpenseRow, type ExpenseRowProps } from "./expense-row";

const base: ExpenseRowProps = {
  description: "Jantar no Time Out Market",
  categoryName: "Alimentação",
  categoryIcon: "utensils",
  categoryColor: 2,
  dateLabel: "Hoje",
  amountInCents: 4850,
  currency: "EUR",
};

describe("ExpenseRow", () => {
  it("shows description, category with date and the formatted amount", () => {
    render(<ExpenseRow {...base} />);
    expect(screen.getByText("Jantar no Time Out Market")).toBeInTheDocument();
    expect(screen.getByText("Alimentação · Hoje")).toBeInTheDocument();
    expect(screen.getByText("€ 48,50")).toBeInTheDocument();
  });

  it("truncates a long description", () => {
    render(<ExpenseRow {...base} />);
    expect(screen.getByText(base.description)).toHaveClass("truncate");
  });

  it("tints the category tile", () => {
    const { container } = render(<ExpenseRow {...base} />);
    expect(container.querySelector(".bg-chart-2\\/13")).toBeInTheDocument();
  });
});
