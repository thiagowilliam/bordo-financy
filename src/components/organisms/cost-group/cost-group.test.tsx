import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CostGroup, type CostGroupProps } from "./cost-group";

const base: CostGroupProps = {
  name: "Passagem",
  icon: "plane",
  color: 1,
  shareLabel: "45,5% do total",
  subtotalInCents: 118640,
  currency: "EUR",
  items: [
    {
      id: "out",
      description: "Voo de ida",
      paidOnLabel: "Pago em 14 jul",
      amountInCents: 61240,
      currency: "EUR",
    },
    {
      id: "back",
      description: "Voo de volta",
      paidOnLabel: "Pago em 14 jul",
      amountInCents: 57400,
      currency: "EUR",
    },
  ],
};

describe("CostGroup", () => {
  it("is a named region with name, share and subtotal", () => {
    render(<CostGroup {...base} />);
    const region = screen.getByRole("region", { name: "Passagem" });
    expect(within(region).getByText("45,5% do total")).toBeInTheDocument();
    expect(within(region).getByText("€ 1.186,40")).toBeInTheDocument();
  });

  it("renders items as a list", () => {
    render(<CostGroup {...base} />);
    const list = screen.getByRole("list");
    expect(within(list).getAllByRole("listitem")).toHaveLength(2);
    expect(within(list).getByText("€ 612,40")).toBeInTheDocument();
    expect(within(list).getByText("Voo de volta")).toBeInTheDocument();
  });
});
