import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteCategoryDialog, type DeleteCategoryDialogProps } from "./delete-category-dialog";

const targets = [
  { id: "a", name: "Alimentação", icon: "utensils", color: 1 },
  { id: "p", name: "Passeios", icon: "ticket", color: 2 },
] as const;

function setup(props: Partial<DeleteCategoryDialogProps> = {}) {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <DeleteCategoryDialog
      open
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      name="Gorjetas"
      usageCount={3}
      totalInCents={2800}
      currency="EUR"
      targets={[...targets]}
      {...props}
    />,
  );
  return { onConfirm, onOpenChange };
}

describe("DeleteCategoryDialog", () => {
  it("explains the move when the category is in use", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Excluir “Gorjetas”?" })).toBeInTheDocument();
    expect(screen.getByText(/3 lançamentos \(.*28,00\) usam esta categoria/)).toBeInTheDocument();
    expect(screen.getByText(/Só a categoria muda/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Mover lançamentos para/ })).toHaveTextContent(
      "Alimentação",
    );
    expect(screen.getByRole("button", { name: "Mover e excluir" })).toBeInTheDocument();
  });

  it("uses the singular for one expense", () => {
    setup({ usageCount: 1 });
    expect(screen.getByText(/^1 lançamento \(/)).toHaveTextContent("usa esta categoria");
  });

  it("confirms with the preselected target", async () => {
    const { onConfirm } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Mover e excluir" }));
    expect(onConfirm).toHaveBeenCalledWith("a");
  });

  it("confirms with the selected target", async () => {
    const { onConfirm } = setup();
    await userEvent.click(screen.getByRole("button", { name: /Mover lançamentos para/ }));
    await userEvent.click(screen.getByRole("option", { name: "Passeios" }));
    await userEvent.click(screen.getByRole("button", { name: "Mover e excluir" }));
    expect(onConfirm).toHaveBeenCalledWith("p");
  });

  it("has no select or warning when unused", async () => {
    const { onConfirm } = setup({ usageCount: 0, totalInCents: 0 });
    expect(
      screen.getByText("Esta categoria não tem lançamentos. Esta ação não pode ser desfeita."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Mover lançamentos para")).not.toBeInTheDocument();
    expect(screen.queryByText(/Só a categoria muda/)).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Excluir" }));
    expect(onConfirm).toHaveBeenCalledWith(undefined);
  });

  it("blocks confirming without targets", () => {
    setup({ targets: [] });
    expect(screen.getByText("Nenhuma outra categoria disponível")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mover e excluir" })).toBeDisabled();
  });

  it("focuses Cancelar first and closes on Escape", async () => {
    const { onOpenChange } = setup();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables buttons and ignores Escape while pending", async () => {
    const { onOpenChange } = setup({ isPending: true });
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Excluindo..." })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
