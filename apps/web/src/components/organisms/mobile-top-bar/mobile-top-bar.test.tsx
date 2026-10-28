import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MobileTopBar } from "./mobile-top-bar";

const user = { name: "Marina", email: "marina@email.com" };

describe("MobileTopBar", () => {
  it("renders the logo and the user initial", () => {
    render(<MobileTopBar user={user} onSignOut={vi.fn()} />);
    expect(screen.getByText("Bordo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Abrir menu da conta" })).toHaveTextContent("M");
  });

  it("renders the tagline", () => {
    render(<MobileTopBar user={user} onSignOut={vi.fn()} />);
    expect(screen.getByText("Diário financeiro de viagem")).toBeInTheDocument();
  });

  it("opens the account sheet and signs out", async () => {
    const onSignOut = vi.fn();
    render(<MobileTopBar user={user} onSignOut={onSignOut} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Abrir menu da conta" }));
    expect(screen.getByRole("dialog", { name: "Menu da conta" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Sair" }));
    expect(onSignOut).toHaveBeenCalledOnce();
  });
});
