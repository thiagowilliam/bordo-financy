import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ChangeEmailDialog, type ChangeEmailDialogProps } from "./change-email-dialog";

function setup(props: Partial<ChangeEmailDialogProps> = {}) {
  const onSubmit = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <ChangeEmailDialog
      open
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      currentEmail="ana@exemplo.com"
      {...props}
    />,
  );
  return { onSubmit, onOpenChange };
}

const send = () => screen.getByRole("button", { name: /Enviar link|Enviando/ });

describe("ChangeEmailDialog", () => {
  it("names the dialog and shows the current email", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Alterar e-mail" })).toHaveAccessibleDescription(
      "Seu e-mail atual é ana@exemplo.com.",
    );
  });

  it.each([
    ["", "Informe o novo e-mail"],
    ["abc", "E-mail inválido"],
    ["ANA@exemplo.com", "Use um e-mail diferente do atual"],
  ])("validates %j", async (value, message) => {
    const { onSubmit } = setup();
    if (value) await userEvent.type(screen.getByLabelText("Novo e-mail"), value);
    await userEvent.click(send());
    expect(screen.getByText(message)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits the trimmed email", async () => {
    const { onSubmit } = setup();
    await userEvent.type(screen.getByLabelText("Novo e-mail"), " nova@exemplo.com ");
    await userEvent.click(send());
    expect(onSubmit).toHaveBeenCalledWith("nova@exemplo.com");
  });

  it("shows the server error under the field", () => {
    setup({ error: "Este e-mail já está em uso." });
    expect(screen.getByLabelText("Novo e-mail")).toHaveAccessibleDescription(
      "Este e-mail já está em uso.",
    );
  });

  it("disables actions and blocks closing while pending", async () => {
    const { onOpenChange } = setup({ isPending: true });
    expect(send()).toBeDisabled();
    expect(send()).toHaveTextContent("Enviando...");
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("clears the field after closing and reopening", async () => {
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <>
          <button onClick={() => setOpen(true)}>abrir</button>
          <ChangeEmailDialog
            open={open}
            onOpenChange={setOpen}
            onSubmit={() => {}}
            currentEmail="ana@exemplo.com"
          />
        </>
      );
    }
    render(<Harness />);
    await userEvent.type(screen.getByLabelText("Novo e-mail"), "x@y.com");
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    await userEvent.click(screen.getByRole("button", { name: "abrir" }));
    expect(screen.getByLabelText("Novo e-mail")).toHaveValue("");
  });
});
