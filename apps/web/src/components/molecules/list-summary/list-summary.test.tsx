import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ListSummary } from "./list-summary";

describe("ListSummary", () => {
  it("shows count, days and total", () => {
    render(<ListSummary count={31} dayCount={11} totalInCents={142080} currency="EUR" />);
    expect(screen.getByText("31 lançamentos em 11 dias")).toBeInTheDocument();
    expect(screen.getByText("€ 1.420,80")).toBeInTheDocument();
  });

  it("omits the days when dayCount is missing", () => {
    render(<ListSummary count={5} totalInCents={100} currency="EUR" />);
    expect(screen.getByText("5 lançamentos")).toBeInTheDocument();
  });

  it("uses singular forms", () => {
    render(<ListSummary count={1} dayCount={1} totalInCents={100} currency="EUR" />);
    expect(screen.getByText("1 lançamento em 1 dia")).toBeInTheDocument();
  });

  it("accepts a className", () => {
    const { container } = render(
      <ListSummary count={1} totalInCents={100} currency="EUR" className="md:hidden" />,
    );
    expect(container.firstChild).toHaveClass("md:hidden");
  });
});
