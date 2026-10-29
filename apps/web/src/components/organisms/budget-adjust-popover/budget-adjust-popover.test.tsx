import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { BudgetAdjustPopover, type BudgetAdjustPopoverProps } from "./budget-adjust-popover";

function setup(props: Partial<BudgetAdjustPopoverProps> = {}) {
  const onSave = vi.fn();
  render(
    <BudgetAdjustPopover
      budgetInCents={500000}
      spentInCents={362130}
      currency="EUR"
      onSave={onSave}
      {...props}
    />,
  );
  return { onSave };
}

async function openIt() {
  await userEvent.click(screen.getByRole("button", { name: "Ajustar orçamento" }));
}

describe("BudgetAdjustPopover", () => {
  it("opens with the current budget and the spent hint", async () => {
    setup();
    await openIt();
    expect(screen.getByLabelText("Orçamento total")).toHaveValue("€\u00a05.000,00");
    expect(screen.getByText(/Você já gastou/)).toHaveTextContent("3.621,30");
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });

  it("saves the new value", async () => {
    const { onSave } = setup();
    await openIt();
    const input = screen.getByLabelText("Orçamento total");
    await userEvent.clear(input);
    await userEvent.type(input, "600000");
    await userEvent.click(screen.getByRole("button", { name: "Salvar" }));
    expect(onSave).toHaveBeenCalledWith(600000);
  });

  it("warns when the value is below what was spent", async () => {
    setup();
    await openIt();
    const input = screen.getByLabelText("Orçamento total");
    await userEvent.clear(input);
    expect(screen.queryByText(/abaixo do que já foi gasto/)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
    await userEvent.type(input, "100000");
    expect(screen.getByText("O orçamento ficará abaixo do que já foi gasto.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeEnabled();
  });

  it("disables saving while pending", async () => {
    setup({ isPending: true, open: true });
    expect(screen.getByRole("button", { name: "Salvar" })).toBeDisabled();
  });

  it("resets the draft when reopened and reports Cancelar", async () => {
    const onOpenChange = vi.fn();
    setup({ onOpenChange });
    await openIt();
    const input = screen.getByLabelText("Orçamento total");
    await userEvent.clear(input);
    await userEvent.type(input, "700000");
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await openIt();
    expect(screen.getByLabelText("Orçamento total")).toHaveValue("€\u00a05.000,00");
  });
});
