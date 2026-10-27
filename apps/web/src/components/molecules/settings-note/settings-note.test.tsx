import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SettingsNote } from "./settings-note";

describe("SettingsNote", () => {
  it("renders its text", () => {
    render(<SettingsNote>Categorias padrão só podem ser ocultadas.</SettingsNote>);
    expect(screen.getByText("Categorias padrão só podem ser ocultadas.")).toBeInTheDocument();
  });
});
