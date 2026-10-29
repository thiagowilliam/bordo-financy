import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DeleteTripDialog, type DeleteTripDialogProps } from "./delete-trip-dialog";

function setup(props: Partial<DeleteTripDialogProps> = {}) {
  const onConfirm = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <DeleteTripDialog
      open
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
      name="Lisboa"
      dailyCount={24}
      baseCount={5}
      photoCount={12}
      {...props}
    />,
  );
  return { onConfirm, onOpenChange };
}

describe("DeleteTripDialog", () => {
  it("shows the title, description and summary", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Excluir Lisboa?" })).toBeInTheDocument();
    expect(
      screen.getByText("Esta viagem e tudo o que está nela serão excluídos."),
    ).toBeInTheDocument();
    expect(screen.getByText("24 gastos do dia a dia")).toBeInTheDocument();
    expect(screen.getByText("5 custos de base")).toBeInTheDocument();
    expect(screen.getByText("12 fotos")).toBeInTheDocument();
  });

  it("uses singular labels", () => {
    setup({ dailyCount: 1, baseCount: 1, photoCount: 1 });
    expect(screen.getByText("1 gasto do dia a dia")).toBeInTheDocument();
    expect(screen.getByText("1 custo de base")).toBeInTheDocument();
    expect(screen.getByText("1 foto")).toBeInTheDocument();
  });

  it("renders the CSV export only when provided", async () => {
    const onExportCsv = vi.fn();
    const { unmount } = render(
      <DeleteTripDialog
        open
        onOpenChange={vi.fn()}
        onConfirm={vi.fn()}
        name="A"
        dailyCount={0}
        baseCount={0}
        photoCount={0}
      />,
    );
    expect(screen.queryByText(/Exportar os gastos/)).not.toBeInTheDocument();
    unmount();
    setup({ onExportCsv });
    await userEvent.click(screen.getByRole("button", { name: /Exportar os gastos em CSV/ }));
    expect(onExportCsv).toHaveBeenCalledTimes(1);
  });

  it("confirms and focuses Cancelar first", async () => {
    const { onConfirm } = setup();
    expect(screen.getByRole("button", { name: "Cancelar" })).toHaveFocus();
    await userEvent.click(screen.getByRole("button", { name: "Excluir viagem" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("cancels through onOpenChange", async () => {
    const { onOpenChange } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("disables actions while pending", () => {
    setup({ isPending: true });
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Excluindo..." })).toBeDisabled();
  });
});
