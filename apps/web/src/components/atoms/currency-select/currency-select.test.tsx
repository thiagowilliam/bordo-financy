import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CurrencySelect } from "./currency-select";

describe("CurrencySelect", () => {
  it("shows the selected currency label", () => {
    render(<CurrencySelect id="currency" value="BRL" onValueChange={() => {}} />);
    expect(screen.getByRole("combobox")).toHaveTextContent("BRL · Real (R$)");
  });

  it("lists the supported currencies and reports the choice", async () => {
    const onValueChange = vi.fn();
    render(<CurrencySelect value="BRL" onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(8);
    await userEvent.click(screen.getByRole("option", { name: "EUR · Euro (€)" }));
    expect(onValueChange).toHaveBeenCalledWith("EUR");
  });
});
