import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { FormField } from "@/components/molecules/form-field";

import { PasswordField } from "./password-field";

describe("PasswordField", () => {
  it("hides the password by default", () => {
    render(<PasswordField aria-label="Senha" />);
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
    const toggle = screen.getByRole("button", { name: "Mostrar senha" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles visibility and the accessible name", async () => {
    const user = userEvent.setup();
    render(<PasswordField aria-label="Senha" />);
    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "text");
    const toggle = screen.getByRole("button", { name: "Ocultar senha" });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    await user.click(toggle);
    expect(screen.getByLabelText("Senha")).toHaveAttribute("type", "password");
  });

  it("does not submit a form when toggling", async () => {
    const user = userEvent.setup();
    let submitted = false;
    render(
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitted = true;
        }}
      >
        <PasswordField aria-label="Senha" />
      </form>,
    );
    await user.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(submitted).toBe(false);
  });

  it("forwards the ref to the input", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<PasswordField aria-label="Senha" ref={ref} />);
    expect(ref.current).toBe(screen.getByLabelText("Senha"));
  });

  it("wires into FormField with error and autocomplete", () => {
    render(
      <FormField label="Senha" error="Senha inválida">
        {(control) => <PasswordField autoComplete="current-password" {...control} />}
      </FormField>,
    );
    const input = screen.getByLabelText("Senha");
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription("Senha inválida");
    expect(input).toHaveAttribute("autocomplete", "current-password");
  });
});
