import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { AmountInput, type AmountInputProps } from "./amount-input";

function Harness({
  initial = 0,
  onChange,
  ...props
}: Partial<AmountInputProps> & { initial?: number; onChange?: (value: number) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <AmountInput
      currency="EUR"
      {...props}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("AmountInput", () => {
  it("masks typed digits and reports minor units", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    const input = screen.getByRole("textbox", { name: "Valor" });
    await userEvent.type(input, "1850");
    expect(input).toHaveValue("18,50");
    expect(onChange).toHaveBeenLastCalledWith(1850);
  });

  it("ignores non-digits", async () => {
    render(<Harness />);
    const input = screen.getByRole("textbox", { name: "Valor" });
    await userEvent.type(input, "a1b2");
    expect(input).toHaveValue("0,12");
  });

  it("shows the placeholder and the symbol when empty", () => {
    render(<Harness />);
    expect(screen.getByRole("textbox")).toHaveAttribute("placeholder", "0,00");
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByText("€")).toBeInTheDocument();
  });

  it("is controlled by value", () => {
    render(<Harness initial={123456} />);
    expect(screen.getByRole("textbox")).toHaveValue("1.234,56");
  });

  it("shows no decimals for zero-decimal currencies", async () => {
    render(<Harness currency="JPY" />);
    const input = screen.getByRole("textbox");
    expect(screen.getByText("¥")).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "0");
    await userEvent.type(input, "1200");
    expect(input).toHaveValue("1.200");
  });

  it("supports a custom label, hint and error", () => {
    render(<Harness aria-label="Valor do gasto" hint="Valor em euros" error="Informe um valor" />);
    const input = screen.getByRole("textbox", { name: "Valor do gasto" });
    expect(input).toBeInvalid();
    expect(screen.getByRole("alert")).toHaveTextContent("Informe um valor");
    expect(input).toHaveAccessibleDescription("Informe um valor Valor em euros");
  });
});
