import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Money } from "./money";

describe("Money", () => {
  it("renders an amount in cents as pt-BR currency", () => {
    render(<Money amount={362130} currency="EUR" />);
    expect(screen.getByText(/3\.621,30/)).toHaveTextContent("€");
  });

  it("uses tabular numbers", () => {
    render(<Money amount={100} currency="BRL" />);
    expect(screen.getByText(/1,00/)).toHaveClass("financial-value");
  });

  it("can hide the cents", () => {
    render(<Money amount={101640} currency="EUR" hideCents />);
    expect(screen.getByText(/1\.016$/)).toBeInTheDocument();
  });

  it("rejects fractional cents", () => {
    expect(() => render(<Money amount={10.5} currency="EUR" />)).toThrow();
  });
});
