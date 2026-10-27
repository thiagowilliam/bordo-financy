import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DayHeader, type DayHeaderProps } from "./day-header";

const base: DayHeaderProps = {
  label: "Dia 11 · 22 out",
  totalInCents: 14130,
  currency: "EUR",
};

describe("DayHeader", () => {
  it("shows the label and the formatted total", () => {
    render(<DayHeader {...base} />);
    expect(screen.getByText("Dia 11 · 22 out")).toBeInTheDocument();
    expect(screen.getByText("€ 141,30")).toBeInTheDocument();
  });

  it("shows the today pill only when isToday", () => {
    const { rerender } = render(<DayHeader {...base} />);
    expect(screen.queryByText("Hoje")).not.toBeInTheDocument();
    rerender(<DayHeader {...base} isToday />);
    expect(screen.getByText("Hoje")).toBeInTheDocument();
  });

  it("renders a downward trend as success", () => {
    render(<DayHeader {...base} trend={{ direction: "down", percent: 70 }} />);
    expect(screen.getByText("70% abaixo da média").parentElement).toHaveClass("text-success-ink");
  });

  it("renders an upward trend as warning", () => {
    render(<DayHeader {...base} trend={{ direction: "up", percent: 23 }} />);
    expect(screen.getByText("23% acima da média").parentElement).toHaveClass("text-warning-ink");
  });

  it("omits the trend by default", () => {
    render(<DayHeader {...base} />);
    expect(screen.queryByText(/da média/)).not.toBeInTheDocument();
  });
});
