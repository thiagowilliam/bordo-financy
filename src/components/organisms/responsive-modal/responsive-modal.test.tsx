import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { ResponsiveModal } from "./responsive-modal";

describe("ResponsiveModal", () => {
  it("renders a dialog and closes on Escape", async () => {
    const onOpenChange = vi.fn();
    render(
      <ResponsiveModal open onOpenChange={onOpenChange}>
        <DialogTitle>Título</DialogTitle>
        <DialogDescription>Descrição</DialogDescription>
        <DialogDescription>Descrição</DialogDescription>
      </ResponsiveModal>,
    );
    expect(screen.getByRole("dialog", { name: "Título" })).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("ignores close requests when locked", async () => {
    const onOpenChange = vi.fn();
    render(
      <ResponsiveModal open locked onOpenChange={onOpenChange}>
        <DialogTitle>Título</DialogTitle>
        <DialogDescription>Descrição</DialogDescription>
        <DialogDescription>Descrição</DialogDescription>
      </ResponsiveModal>,
    );
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
