import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ExpenseDatePicker } from "./expense-date-picker";
import { formatExpenseDate } from "./expense-date-label";

const trip = { today: "2026-10-22", tripStartDate: "2026-10-12", tripEndDate: "2026-10-26" };

function Harness({
  initial,
  onChange,
  label = "Data",
}: {
  initial: string;
  onChange?: (value: string) => void;
  label?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <ExpenseDatePicker
      label={label}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
      {...trip}
    />
  );
}

describe("formatExpenseDate", () => {
  it("prefixes today and counts the trip day", () => {
    expect(formatExpenseDate("2026-10-22", "2026-10-22", "2026-10-12")).toBe(
      "Hoje, 22 out · Dia 11",
    );
  });

  it("omits Hoje for other days", () => {
    expect(formatExpenseDate("2026-10-21", "2026-10-22", "2026-10-12")).toBe("21 out · Dia 10");
  });

  it("omits the trip day before the trip", () => {
    expect(formatExpenseDate("2026-10-05", "2026-10-22", "2026-10-12")).toBe("5 out");
  });
});

describe("ExpenseDatePicker", () => {
  it("shows the today label on the trigger", () => {
    render(<Harness initial="2026-10-22" />);
    expect(screen.getByRole("button", { name: "Data Hoje, 22 out · Dia 11" })).toBeInTheDocument();
  });

  it("uses the label prop", () => {
    render(<Harness initial="2026-10-21" label="Data de pagamento" />);
    expect(
      screen.getByRole("button", { name: "Data de pagamento 21 out · Dia 10" }),
    ).toBeInTheDocument();
  });

  it("opens a calendar with the legend and selects a day", async () => {
    const onChange = vi.fn();
    render(<Harness initial="2026-10-22" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /^Data/ }));
    expect(screen.getByText("outubro 2026")).toBeInTheDocument();
    expect(screen.getByText("Dias da viagem")).toBeInTheDocument();
    expect(screen.getByText("Selecionado")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /18 de outubro/ }));
    expect(onChange).toHaveBeenCalledWith("2026-10-18");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Data 18 out · Dia 7" })).toBeInTheDocument();
  });

  it("jumps to today with Ir para hoje", async () => {
    const onChange = vi.fn();
    render(<Harness initial="2026-10-15" onChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: /^Data/ }));
    await userEvent.click(screen.getByRole("button", { name: "Ir para hoje" }));
    expect(onChange).toHaveBeenCalledWith("2026-10-22");
    expect(screen.getByRole("button", { name: /Hoje, 22 out/ })).toBeInTheDocument();
  });

  it("closes with Escape", async () => {
    render(<Harness initial="2026-10-22" />);
    await userEvent.click(screen.getByRole("button", { name: /^Data/ }));
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
