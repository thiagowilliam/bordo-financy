import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { GoogleButton } from "./google-button";

describe("GoogleButton", () => {
  it("renders the default label as a non-submit button", async () => {
    const onClick = vi.fn();
    render(<GoogleButton onClick={onClick} />);
    const button = screen.getByRole("button", { name: "Continuar com Google" });
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("accepts a custom label", () => {
    render(<GoogleButton label="Vincular" />);
    expect(screen.getByRole("button", { name: "Vincular" })).toBeInTheDocument();
  });

  it("is disabled and busy while loading", () => {
    render(<GoogleButton isLoading />);
    const button = screen.getByRole("button", { name: "Conectando..." });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("supports a custom loading label", () => {
    render(<GoogleButton isLoading loadingLabel="Aguarde" />);
    expect(screen.getByRole("button", { name: "Aguarde" })).toBeDisabled();
  });
});
