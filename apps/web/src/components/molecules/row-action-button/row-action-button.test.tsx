import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { RowActionButton } from "./row-action-button";

describe("RowActionButton", () => {
  it("is a named button of type button", () => {
    render(<RowActionButton icon={<svg />} label="Editar lançamento" />);
    const button = screen.getByRole("button", { name: "Editar lançamento" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("size-[34px]", "text-muted-foreground");
  });

  it("uses the destructive tone", () => {
    render(<RowActionButton tone="destructive" icon={<svg />} label="Excluir lançamento" />);
    expect(screen.getByRole("button", { name: "Excluir lançamento" })).toHaveClass(
      "text-destructive",
    );
  });

  it("calls onClick", async () => {
    const onClick = vi.fn();
    render(<RowActionButton icon={<svg />} label="Editar" onClick={onClick} />);
    await userEvent.click(screen.getByRole("button", { name: "Editar" }));
    expect(onClick).toHaveBeenCalledOnce();
  });
});
