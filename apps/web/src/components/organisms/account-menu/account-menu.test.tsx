import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { AccountMenu, type AccountMenuProps } from "./account-menu";

function setup(props: Partial<AccountMenuProps> = {}) {
  const onSignOut = vi.fn();
  render(
    <AccountMenu
      user={{ name: "Marina", email: "marina@email.com" }}
      onSignOut={onSignOut}
      {...props}
    />,
  );
  return { onSignOut };
}

async function open() {
  await userEvent.click(screen.getByRole("button", { name: "Menu da conta" }));
}

describe("AccountMenu", () => {
  it("renders the user in the trigger", () => {
    setup();
    const trigger = screen.getByRole("button", { name: "Menu da conta" });
    expect(trigger).toHaveTextContent("Marina");
    expect(trigger).toHaveTextContent("marina@email.com");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("opens with the three items and the user header", async () => {
    setup();
    await open();
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getAllByText("Marina")).toHaveLength(2);
    expect(screen.getAllByRole("menuitem").map((item) => item.textContent)).toEqual([
      "Perfil",
      "Configurações",
      "Sair",
    ]);
  });

  it("links to profile and settings", async () => {
    setup();
    await open();
    expect(screen.getByRole("menuitem", { name: "Perfil" })).toHaveAttribute("href", "/perfil");
    expect(screen.getByRole("menuitem", { name: "Configurações" })).toHaveAttribute(
      "href",
      "/configuracoes/categorias",
    );
  });

  it("calls onSignOut from Sair", async () => {
    const { onSignOut } = setup();
    await open();
    await userEvent.click(screen.getByRole("menuitem", { name: "Sair" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it("disables Sair while signing out", async () => {
    const { onSignOut } = setup({ isSigningOut: true });
    await open();
    const item = screen.getByRole("menuitem", { name: "Saindo..." });
    expect(item).toHaveAttribute("aria-disabled", "true");
    await userEvent.click(item);
    expect(onSignOut).not.toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    setup();
    await open();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
