import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccountSheet, type AccountSheetProps } from "./account-sheet";

function setup(props: Partial<AccountSheetProps> = {}) {
  const onOpenChange = vi.fn();
  const onSignOut = vi.fn();
  render(
    <AccountSheet
      user={{ name: "Marina", email: "marina@email.com" }}
      open
      onOpenChange={onOpenChange}
      onSignOut={onSignOut}
      {...props}
    />,
  );
  return { onOpenChange, onSignOut };
}

describe("AccountSheet", () => {
  it("renders a dialog named Menu da conta with the user info", () => {
    setup();
    expect(screen.getByRole("dialog", { name: "Menu da conta" })).toBeInTheDocument();
    expect(screen.getByText("Marina")).toBeInTheDocument();
    expect(screen.getByText("marina@email.com")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    setup({ open: false });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("links to profile and settings", () => {
    setup();
    expect(screen.getByRole("link", { name: "Perfil" })).toHaveAttribute("href", "/perfil");
    expect(screen.getByRole("link", { name: "Configurações" })).toHaveAttribute(
      "href",
      "/configuracoes/categorias",
    );
  });

  it("closes when a link is clicked", async () => {
    const { onOpenChange } = setup();
    await userEvent.click(screen.getByRole("link", { name: "Perfil" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("calls onSignOut without closing", async () => {
    const { onOpenChange, onSignOut } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(onSignOut).toHaveBeenCalledOnce();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("disables Sair while signing out", () => {
    setup({ isSigningOut: true });
    expect(screen.getByRole("button", { name: "Saindo..." })).toBeDisabled();
  });
});
