import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { PaymentMethod } from "@/features/expenses";

import { PaymentPicker } from "./payment-picker";

function Harness({
  initial,
  onChange,
}: {
  initial?: PaymentMethod;
  onChange?: (method: PaymentMethod) => void;
}) {
  const [value, setValue] = useState(initial);
  return (
    <PaymentPicker
      value={value}
      onValueChange={(method) => {
        setValue(method);
        onChange?.(method);
      }}
    />
  );
}

const open = () => userEvent.click(screen.getByRole("button", { name: /^Forma de pagamento/ }));

describe("PaymentPicker", () => {
  it("shows the current method label on the trigger", () => {
    render(<Harness initial="INTERNATIONAL_CARD" />);
    expect(
      screen.getByRole("button", { name: "Forma de pagamento Cartão internacional" }),
    ).toBeInTheDocument();
  });

  it("lists the five methods and checks the current one", async () => {
    render(<Harness initial="PIX" />);
    await open();
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    expect(screen.getByRole("radio", { name: "Pix" })).toBeChecked();
  });

  it("selects a method and closes", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await open();
    await userEvent.click(screen.getByRole("radio", { name: "Débito" }));
    expect(onChange).toHaveBeenCalledWith("DEBIT");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Forma de pagamento Débito" })).toBeInTheDocument();
  });

  it("moves focus with the arrow keys and selects with Enter", async () => {
    const onChange = vi.fn();
    render(<Harness initial="CASH" onChange={onChange} />);
    await open();
    expect(screen.getByRole("radio", { name: "Dinheiro" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("PIX");
  });

  it("closes with Escape", async () => {
    render(<Harness />);
    await open();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows an error", () => {
    render(<PaymentPicker value={undefined} onValueChange={() => {}} error="Obrigatório" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Obrigatório");
  });
});
