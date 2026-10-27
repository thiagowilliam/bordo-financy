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

describe("TextField trailing slot", () => {
  it("renders the trailing element", () => {
    render(<TextField aria-label="Destino" trailing={<button type="button">Limpar</button>} />);
    expect(screen.getByRole("button", { name: "Limpar" })).toBeInTheDocument();
  });

  it("forwards the ref to the input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<TextField aria-label="Destino" ref={ref} />);
    expect(ref.current).toBe(screen.getByRole("textbox"));
  });
});
