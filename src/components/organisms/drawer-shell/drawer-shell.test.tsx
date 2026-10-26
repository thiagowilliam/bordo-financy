import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { DrawerShell } from "./drawer-shell";

function mockViewport(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({ matches, addEventListener: vi.fn(), removeEventListener: vi.fn() }),
  );
}

afterEach(() => vi.unstubAllGlobals());

const baseProps = {
  title: "Lançar gasto",
  context: "Lisboa & Sintra · Dia 11",
  description: "Registre um gasto da viagem.",
};

describe("DrawerShell", () => {
  it("renders title, context, body and footer in an accessible dialog", () => {
    mockViewport(true);
    render(
      <DrawerShell open onOpenChange={() => {}} footer={<button>Salvar</button>} {...baseProps}>
        <p>Corpo</p>
      </DrawerShell>,
    );
    const dialog = screen.getByRole("dialog", { name: "Lançar gasto" });
    expect(dialog).toHaveAccessibleDescription("Registre um gasto da viagem.");
    expect(dialog).toHaveTextContent("Lisboa & Sintra · Dia 11");
    expect(screen.getByText("Corpo")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Salvar" })).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    mockViewport(true);
    render(
      <DrawerShell open={false} onOpenChange={() => {}} {...baseProps}>
        <p>Corpo</p>
      </DrawerShell>,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes with the close button and with Escape", async () => {
    mockViewport(true);
    const onOpenChange = vi.fn();
    render(
      <DrawerShell open onOpenChange={onOpenChange} {...baseProps}>
        <p>Corpo</p>
      </DrawerShell>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Fechar" }));
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledTimes(2);
  });

  it("works as a bottom sheet below md", () => {
    mockViewport(false);
    render(
      <DrawerShell open onOpenChange={() => {}} {...baseProps}>
        <p>Corpo</p>
      </DrawerShell>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("data-side", "bottom");
  });
});
