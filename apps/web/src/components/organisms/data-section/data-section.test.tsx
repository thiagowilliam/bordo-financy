import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { DataSection } from "./data-section";

describe("DataSection", () => {
  it("calls onExport", async () => {
    const onExport = vi.fn();
    render(<DataSection onExport={onExport} />);
    expect(screen.getByRole("heading", { level: 2, name: "Seus dados" })).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "Exportar" }));
    expect(onExport).toHaveBeenCalledOnce();
  });

  it("disables the button while exporting", () => {
    render(<DataSection onExport={() => {}} isExporting />);
    expect(screen.getByRole("button", { name: "Exportando..." })).toBeDisabled();
  });

  it("links to the settings area", () => {
    render(<DataSection onExport={() => {}} />);
    expect(screen.getByRole("link", { name: /Configurações/ })).toHaveAttribute(
      "href",
      "/configuracoes/categorias",
    );
  });
});
