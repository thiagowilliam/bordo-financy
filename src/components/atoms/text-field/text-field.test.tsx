import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextField } from "./text-field";

describe("TextField", () => {
  it("renders an input with a placeholder", () => {
    render(<TextField aria-label="Destino" placeholder="Ex.: Grécia" />);
    expect(screen.getByRole("textbox", { name: "Destino" })).toHaveAttribute(
      "placeholder",
      "Ex.: Grécia",
    );
  });

  it("hides the icon from assistive tech", () => {
    render(<TextField aria-label="Destino" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards aria-invalid", () => {
    render(<TextField aria-label="Destino" aria-invalid />);
    expect(screen.getByRole("textbox")).toBeInvalid();
  });
});
