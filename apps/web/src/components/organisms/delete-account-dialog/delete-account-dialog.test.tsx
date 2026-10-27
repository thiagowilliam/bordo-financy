import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { DeleteAccountDialog, type DeleteAccountDialogProps } from "./delete-account-dialog";

function setup(props: Partial<DeleteAccountDialogProps> = {}) {
  const onConfirm = vi.fn();
  const onExport = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <DeleteAccountDialog
      open
      onOpenChange={onOpenChange}
      tripCount={4}
      onExport={onExport}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { onConfirm, onExport, onOpenChange };
}

const confirm = () => screen.getByRole("button", { name: /Excluir conta|Excluindo/ });
const field = () => screen.getByLabelText("Digite EXCLUIR para confirmar");

describe("DeleteAccountDialog", () => {
  it("names the dialog and lists what is deleted", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Excluir sua conta?" })).toBeInTheDocument();
    expect(
      screen.getByText("Todas as suas viagens (4) e os gastos registrados"),
    ).toBeInTheDocument();
  });

  it("enables the button only when the text is EXCLUIR (case-sensitive, trimmed)", async () => {
    const { onConfirm } = setup();
    expect(confirm()).toBeDisabled();
    await userEvent.type(field(), "excluir");
    expect(confirm()).toBeDisabled();
    expect(screen.queryByTestId("confirmation-check")).not.toBeInTheDocument();
    await userEvent.clear(field());
    await userEvent.type(field(), " EXCLUIR ");
    expect(confirm()).toBeEnabled();
    expect(screen.getByTestId("confirmation-check")).toBeInTheDocument();
    await userEvent.click(confirm());
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onExport and shows the exporting state", async () => {
    const { onExport } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Exportar CSV" }));
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it("disables export while exporting", () => {
    setup({ isExporting: true });
    expect(screen.getByRole("button", { name: "Exportando..." })).toBeDisabled();
  });

  it("locks everything while pending", async () => {
    const { onOpenChange } = setup({ isPending: true });
    expect(confirm()).toBeDisabled();
    expect(confirm()).toHaveTextContent("Excluindo...");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("shows the server error", () => {
    setup({ error: "Falhou" });
    expect(field()).toHaveAccessibleDescription("Falhou");
  });

  it("clears the typed text when reopened", async () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button onClick={() => setOpen(true)}>abrir</button>
          <DeleteAccountDialog
            open={open}
            onOpenChange={setOpen}
            tripCount={1}
            onExport={() => {}}
            onConfirm={() => {}}
          />
        </>
      );
    }
    render(<Harness />);
    await userEvent.type(field(), "EXCLUIR");
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await userEvent.click(screen.getByRole("button", { name: "abrir" }));
    expect(field()).toHaveValue("");
  });
});
