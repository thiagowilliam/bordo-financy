import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SecuritySection, type SecuritySectionProps } from "./security-section";

const base: SecuritySectionProps = {
  provider: "PASSWORD",
  email: "marina@exemplo.com",
  linkSent: false,
  onSendPasswordLink: () => {},
};

describe("SecuritySection", () => {
  it("sends the password link", async () => {
    const onSendPasswordLink = vi.fn();
    render(<SecuritySection {...base} onSendPasswordLink={onSendPasswordLink} />);
    expect(screen.getByRole("heading", { level: 2, name: "Segurança" })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Alterar senha" }));
    expect(onSendPasswordLink).toHaveBeenCalledOnce();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the confirmation and a resend button once the link was sent", () => {
    render(<SecuritySection {...base} linkSent />);
    expect(screen.getByRole("button", { name: "Reenviar link" })).toBeVisible();
    expect(screen.getByRole("status")).toHaveTextContent("Link enviado para marina@exemplo.com");
  });

  it("disables the button while sending", () => {
    render(<SecuritySection {...base} isSending />);
    expect(screen.getByRole("button", { name: "Enviando..." })).toBeDisabled();
  });

  it("explains Google accounts and has no button", () => {
    render(<SecuritySection {...base} provider="GOOGLE" />);
    expect(screen.getByText("Você entra com sua conta Google")).toBeVisible();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
