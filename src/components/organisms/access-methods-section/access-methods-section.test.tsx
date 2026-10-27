import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccessMethodsSection, type AccessMethodsSectionProps } from "./access-methods-section";

const base: AccessMethodsSectionProps = {
  googleEmail: "marina@gmail.com",
  hasPassword: true,
  email: "marina@exemplo.com",
  linkSent: false,
  onSendPasswordLink: () => {},
  onConnectGoogle: () => {},
};

describe("AccessMethodsSection", () => {
  it("shows google and password connected", () => {
    render(<AccessMethodsSection {...base} />);
    expect(screen.getByRole("heading", { level: 2, name: "Métodos de acesso" })).toBeVisible();
    expect(screen.getByText("Conectado como marina@gmail.com")).toBeVisible();
    expect(screen.getByText("Conectado")).toBeVisible();
    expect(screen.getByText(/criar uma nova senha/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Alterar senha" })).toBeVisible();
    expect(screen.queryByRole("button", { name: /Conectar Google/ })).not.toBeInTheDocument();
    expect(screen.getByText(/mesma conta, com as mesmas viagens/)).toBeVisible();
  });

  it("offers adding a password when there is none", () => {
    render(<AccessMethodsSection {...base} hasPassword={false} />);
    expect(screen.getByText(/Adicione uma senha/)).toBeVisible();
    expect(screen.getByRole("button", { name: "Adicionar senha" })).toBeVisible();
  });

  it("offers connecting Google when not connected", async () => {
    const onConnectGoogle = vi.fn();
    render(<AccessMethodsSection {...base} googleEmail={null} onConnectGoogle={onConnectGoogle} />);
    expect(screen.getByText("Entre com um clique usando sua conta Google.")).toBeVisible();
    expect(screen.queryByText("Conectado")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Conectar Google/ }));
    expect(onConnectGoogle).toHaveBeenCalledOnce();
  });

  it("sends the password link", async () => {
    const onSendPasswordLink = vi.fn();
    render(<AccessMethodsSection {...base} onSendPasswordLink={onSendPasswordLink} />);
    await userEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    expect(onSendPasswordLink).toHaveBeenCalledOnce();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the sent note and a resend button", () => {
    const { rerender } = render(<AccessMethodsSection {...base} linkSent />);
    expect(screen.getByRole("button", { name: "Reenviar link" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent(
      "Enviamos um link para marina@exemplo.com criar sua nova senha.",
    );
    rerender(<AccessMethodsSection {...base} hasPassword={false} linkSent />);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Enviamos um link para marina@exemplo.com criar sua senha.",
    );
  });

  it("disables the password button while sending", () => {
    render(<AccessMethodsSection {...base} isSending />);
    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
  });
});
