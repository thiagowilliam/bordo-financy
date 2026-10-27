import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DangerZone } from "./danger-zone";

describe("DangerZone", () => {
  it("renders the warning and calls onDelete", async () => {
    const onDelete = vi.fn();
    render(<DangerZone onDelete={onDelete} />);
    expect(screen.getByRole("heading", { level: 2, name: "ZONA DE RISCO" })).toBeVisible();
    expect(
      screen.getByText("Todas as suas viagens, gastos e fotos serão apagados permanentemente."),
    ).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Excluir conta" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });
});
