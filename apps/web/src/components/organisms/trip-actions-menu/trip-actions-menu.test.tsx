import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TripActionsMenu } from "./trip-actions-menu";

function mockViewport(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("TripActionsMenu", () => {
  it("opens a dropdown on desktop and calls onEdit", async () => {
    mockViewport(true);
    const onEdit = vi.fn();
    render(<TripActionsMenu onEdit={onEdit} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Opções da viagem" }));
    expect(screen.getByRole("menuitem", { name: "Excluir viagem" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("menuitem", { name: "Editar viagem" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls onDelete from the dropdown", async () => {
    mockViewport(true);
    const onDelete = vi.fn();
    render(<TripActionsMenu onEdit={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: "Opções da viagem" }));
    await userEvent.click(screen.getByRole("menuitem", { name: "Excluir viagem" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("opens a bottom sheet below md with a Cancelar row", async () => {
    mockViewport(false);
    const onDelete = vi.fn();
    render(<TripActionsMenu onEdit={vi.fn()} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: "Opções da viagem" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar viagem" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Excluir viagem" }));
    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("cancels the sheet without calling handlers", async () => {
    mockViewport(false);
    const onEdit = vi.fn();
    render(<TripActionsMenu onEdit={onEdit} onDelete={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Opções da viagem" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onEdit).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("never lets the trigger click reach a parent link", async () => {
    mockViewport(false);
    const onParentClick = vi.fn();
    render(
      <div onClick={onParentClick}>
        <TripActionsMenu onEdit={vi.fn()} onDelete={vi.fn()} />
      </div>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Opções da viagem" }));
    expect(onParentClick).not.toHaveBeenCalled();
  });
});
