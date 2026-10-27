import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SpendByDayChart, type SpendByDayChartProps } from "./spend-by-day-chart";

const base: SpendByDayChartProps = {
  days: [
    { day: 12, amountInCents: 8450, state: "past" },
    { day: 13, amountInCents: 12300, state: "past" },
    { day: 14, amountInCents: 9380, state: "today" },
    { day: 15, amountInCents: 0, state: "future" },
  ],
  currency: "EUR",
  averageInCents: 9240,
  subtitle: "Dia a dia, de 12 a 26 out",
};

describe("SpendByDayChart", () => {
  it("renders title, subtitle and the formatted daily average", () => {
    render(<SpendByDayChart {...base} />);
    expect(screen.getByRole("heading", { name: "Gasto por dia" })).toBeInTheDocument();
    expect(screen.getByText("Dia a dia, de 12 a 26 out")).toBeInTheDocument();
    expect(screen.getByText("€ 92,40")).toHaveClass("text-primary-strong");
    expect(screen.getByText("Média diária", { selector: "span" })).toBeInTheDocument();
  });

  it("is named by its heading as a region", () => {
    render(<SpendByDayChart {...base} />);
    expect(screen.getByRole("region", { name: "Gasto por dia" })).toBeInTheDocument();
  });

  it("offers an accessible table with past and current days only", () => {
    render(<SpendByDayChart {...base} />);
    const table = screen.getByRole("table", { name: "Gasto por dia da viagem" });
    const rows = within(table).getAllByRole("row");
    expect(rows).toHaveLength(4); // header + 3 days
    expect(within(table).getByText("Dia 13")).toBeInTheDocument();
    expect(within(table).getByText("€ 123,00")).toBeInTheDocument();
    expect(within(table).queryByText("Dia 15")).not.toBeInTheDocument();
  });
});
