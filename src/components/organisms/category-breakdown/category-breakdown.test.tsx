import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryBreakdown, type CategoryBreakdownProps } from "./category-breakdown";

const base: CategoryBreakdownProps = {
  currency: "EUR",
  items: [
    { id: "lodging", name: "Hospedagem", color: 1, amountInCents: 150000 },
    { id: "food", name: "Alimentação", color: 2, amountInCents: 50000 },
  ],
};

describe("CategoryBreakdown", () => {
  it("lists each category with percent and an sr-only amount", () => {
    render(<CategoryBreakdown {...base} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Hospedagem");
    expect(items[0]).toHaveTextContent("€ 1.500");
    expect(items[0]).toHaveTextContent("75%");
    expect(items[1]).toHaveTextContent("25%");
  });

  it("shows the total in the donut center", () => {
    render(<CategoryBreakdown {...base} />);
    expect(screen.getByText("Dia a dia")).toBeInTheDocument();
    expect(screen.getByText("€ 2.000")).toBeInTheDocument();
  });

  it("has a named region", () => {
    render(<CategoryBreakdown {...base} />);
    expect(screen.getByRole("region", { name: "Gastos por categoria" })).toBeInTheDocument();
  });

  it("renders an empty message without items", () => {
    render(<CategoryBreakdown {...base} items={[]} />);
    expect(screen.getByText("Nenhum gasto por categoria ainda")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
