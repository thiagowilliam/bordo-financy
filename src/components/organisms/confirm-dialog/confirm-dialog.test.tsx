import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ConfirmDialog, type ConfirmDialogProps } from "./confirm-dialog";

function setup(props: Partial<ConfirmDialogProps> = {}) {
  const onOpenChange = vi.fn();
  const onConfirm = vi.fn();
  render(
    <ConfirmDialog
      open
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      title="Excluir lançamento?"
      description="Essa ação não pode ser desfeita."
      {...props}
    />,
  );
  return { onOpenChange, onConfirm };
}

describe("ConfirmDialog", () => {
  it("renders title, description and default labels", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Excluir lançamento?" })).toBeInTheDocument();
    expect(screen.getByText("Essa ação não pode ser desfeita.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir" })).toBeInTheDocument();
  });

  it("focuses Cancelar first", () => {
    setup();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
  });

  it("confirms", async () => {
    const { onConfirm } = setup({ confirmLabel: "Excluir custo" });
    await userEvent.click(screen.getByRole("button", { name: "Excluir custo" }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it("cancels", async () => {
    const { onOpenChange, onConfirm } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const { onOpenChange } = setup();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables buttons, shows Excluindo... and ignores Escape while pending", async () => {
    const { onOpenChange } = setup({ isPending: true });
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Excluindo..." })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
