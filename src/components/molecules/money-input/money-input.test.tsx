import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import type { CurrencyCode } from "@/lib/money";

import { MoneyInput } from "./money-input";

function Harness({
  currency = "EUR",
  onValue,
}: {
  currency?: CurrencyCode;
  onValue?: (value: number) => void;
}) {
  const [value, setValue] = useState(0);
  return (
    <MoneyInput
      aria-label="Orçamento"
      placeholder="0,00"
      currency={currency}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onValue?.(next);
      }}
    />
  );
}

const shown = () => screen.getByRole("textbox").getAttribute("value")?.replace(/\s/g, " ");

describe("MoneyInput", () => {
  it("formats digits cents-first while typing", async () => {
    const onValue = vi.fn();
    render(<Harness onValue={onValue} />);
    await userEvent.type(screen.getByRole("textbox"), "540000");
    expect(shown()).toBe("€ 5.400,00");
    expect(onValue).toHaveBeenLastCalledWith(540000);
  });

  it("ignores non digit characters", async () => {
    render(<Harness />);
    await userEvent.type(screen.getByRole("textbox"), "1a2");
    expect(shown()).toBe("€ 0,12");
  });

  it("removes the last digit on backspace", async () => {
    render(<Harness />);
    await userEvent.type(screen.getByRole("textbox"), "125{Backspace}");
    expect(shown()).toBe("€ 0,12");
  });

  it("keeps the digits when the currency changes and drops the fraction for JPY", async () => {
    const { rerender } = render(
      <MoneyInput aria-label="Orçamento" currency="EUR" value={540000} onValueChange={() => {}} />,
    );
    expect(shown()).toBe("€ 5.400,00");
    rerender(
      <MoneyInput aria-label="Orçamento" currency="JPY" value={540000} onValueChange={() => {}} />,
    );
    expect(shown()).toBe("¥ 540.000");
  });

  it("shows the placeholder when empty", () => {
    render(<Harness />);
    expect(screen.getByPlaceholderText("0,00")).toHaveValue("");
  });
});
