import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CostItemRow, type CostItemRowProps } from "./cost-item-row";

const base: CostItemRowProps = {
  description: "Voo de ida",
  paidOnLabel: "Pago em 14 jul",
  amountInCents: 61240,
  currency: "EUR",
};

describe("CostItemRow", () => {
  it("shows description, paid label and formatted amount", () => {
    render(
      <CostItemRow
        description="Voo de ida"
        paidOnLabel="Pago em 14 jul"
        amountInCents={61240}
        currency="EUR"
      />,
    );
    expect(screen.getByText("Voo de ida")).toBeInTheDocument();
    expect(screen.getByText("Pago em 14 jul")).toBeInTheDocument();
    expect(screen.getByText("€ 612,40")).toBeInTheDocument();
  });

  it("has no button without onSelect", () => {
    render(<CostItemRow {...base} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("selects through click, Enter and Space", async () => {
    const onSelect = vi.fn();
    render(<CostItemRow {...base} onSelect={onSelect} />);
    const button = screen.getByRole("button", { name: "Editar custo: Voo de ida" });
    await userEvent.click(button);
    button.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(3);
  });

  it("renders actions outside the select button, revealed on hover and focus", () => {
    const { container } = render(
      <CostItemRow
        {...base}
        onSelect={() => {}}
        actions={<button type="button" aria-label="Excluir custo" />}
      />,
    );
    const select = screen.getByRole("button", { name: "Editar custo: Voo de ida" });
    const action = screen.getByRole("button", { name: "Excluir custo" });
    expect(select).not.toContainElement(action);
    expect(container.querySelector("[data-slot='cost-actions']")).toHaveClass(
      "group-hover:opacity-100",
      "group-focus-within:opacity-100",
    );
  });
});
