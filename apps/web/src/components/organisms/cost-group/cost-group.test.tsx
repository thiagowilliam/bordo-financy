import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

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

  it("makes items selectable and renders their actions outside the button", async () => {
    const onSelect = vi.fn();
    render(
      <CostGroup
        {...base}
        items={[
          {
            ...base.items[0]!,
            onSelect,
            actions: <button type="button" aria-label="Excluir custo" />,
          },
          base.items[1]!,
        ]}
      />,
    );
    const select = screen.getByRole("button", { name: "Editar custo: Voo de ida" });
    await userEvent.click(select);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(select).not.toContainElement(screen.getByRole("button", { name: "Excluir custo" }));
    expect(screen.queryByRole("button", { name: /Voo de volta/ })).not.toBeInTheDocument();
  });
});
