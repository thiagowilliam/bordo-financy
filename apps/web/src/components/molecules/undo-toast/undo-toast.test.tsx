import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UndoToast } from "./undo-toast";

describe("UndoToast", () => {
  it("shows the message and calls the action", async () => {
    const onAction = vi.fn();
    render(<UndoToast message="Viagem excluída" onAction={onAction} durationMs={8000} />);
    expect(screen.getByText("Viagem excluída")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(onAction).toHaveBeenCalledOnce();
  });

  it("runs the bar for the whole undo window", () => {
    render(<UndoToast message="Viagem excluída" onAction={() => undefined} durationMs={8000} />);
    expect(screen.getByTestId("undo-bar")).toHaveStyle({ transition: "transform 8000ms linear" });
  });
});
