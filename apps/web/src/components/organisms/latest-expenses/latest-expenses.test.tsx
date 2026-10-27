import { render, screen, within } from "@testing-library/react";
import type { Route } from "next";
import { describe, expect, it } from "vitest";

import { LatestExpenses, type LatestExpensesProps } from "./latest-expenses";

const href = "/viagens/trip-1/dia-a-dia" as Route;

const base: LatestExpensesProps = {
  viewAllHref: href,
  expenses: [
    {
      id: "1",
      href,
      description: "Jantar no Time Out Market",
      categoryName: "Alimentação",
      categoryIcon: "utensils",
      categoryColor: 2,
      dateLabel: "Hoje",
      amountInCents: 4850,
      currency: "EUR",
    },
    {
      id: "2",
      href,
      description: "Ingresso Palácio da Pena",
      categoryName: "Passeios",
      categoryIcon: "ticket",
      categoryColor: 3,
      dateLabel: "Ontem",
      amountInCents: 2000,
      currency: "EUR",
    },
  ],
};

describe("LatestExpenses", () => {
  it("renders a row per expense with formatted money", () => {
    render(<LatestExpenses {...base} />);
    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent("Alimentação · Hoje");
    expect(items[0]).toHaveTextContent("€ 48,50");
    expect(items[1]).toHaveTextContent("Alimentação · Ontem".replace("Alimentação", "Passeios"));
  });

  it("links to the full list", () => {
    render(<LatestExpenses {...base} />);
    expect(screen.getByRole("link", { name: "Ver todos" })).toHaveAttribute("href", href);
  });

  it("renders rows without dividers", () => {
    render(<LatestExpenses {...base} />);
    for (const item of screen.getAllByRole("listitem")) {
      expect(item).not.toHaveClass("border-b");
    }
  });

  it("shows the empty state", () => {
    render(<LatestExpenses {...base} expenses={[]} />);
    expect(screen.getByText("Nenhum lançamento ainda")).toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});
