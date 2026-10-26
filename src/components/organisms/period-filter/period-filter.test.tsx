import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PeriodFilter } from "./period-filter";
import { formatPeriodSummary } from "./period-label";

const bounds = { minDate: "2026-10-18", maxDate: "2026-10-26" };

describe("PeriodFilter", () => {
  it("shows Período and is inactive without a value", () => {
    render(<PeriodFilter value={null} onValueChange={() => {}} {...bounds} />);
    expect(screen.getByRole("button", { name: "Período" })).not.toHaveAttribute("data-active");
  });

  it("uses the preset name as label and is active", () => {
    render(<PeriodFilter value={{ preset: "yesterday" }} onValueChange={() => {}} {...bounds} />);
    expect(screen.getByRole("button", { name: "Ontem" })).toHaveAttribute("data-active", "true");
  });

  it("applies a preset immediately and closes", async () => {
    const onValueChange = vi.fn();
    render(<PeriodFilter value={null} onValueChange={onValueChange} {...bounds} />);
    await userEvent.click(screen.getByRole("button", { name: "Período" }));
    await userEvent.click(screen.getByRole("button", { name: "Últimos 3 dias" }));
    expect(onValueChange).toHaveBeenCalledWith({ preset: "last3" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("applies a custom range only on Aplicar", async () => {
    const onValueChange = vi.fn();
    render(<PeriodFilter value={null} onValueChange={onValueChange} {...bounds} />);
    await userEvent.click(screen.getByRole("button", { name: "Período" }));
    expect(screen.getByRole("button", { name: "Aplicar" })).toBeDisabled();

    await userEvent.click(screen.getByRole("button", { name: /20 de outubro/ }));
    await userEvent.click(screen.getByRole("button", { name: /22 de outubro/ }));
    expect(screen.getByText("3 dias selecionados")).toBeInTheDocument();
    expect(screen.getByLabelText("Início")).toHaveValue("20 out 2026");
    expect(screen.getByLabelText("Fim")).toHaveValue("22 out 2026");
    expect(onValueChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(onValueChange).toHaveBeenCalledWith({
      preset: "custom",
      from: "2026-10-20",
      to: "2026-10-22",
    });
  });

  it("disables dates outside the bounds", async () => {
    render(<PeriodFilter value={null} onValueChange={() => {}} {...bounds} />);
    await userEvent.click(screen.getByRole("button", { name: "Período" }));
    expect(screen.getByRole("button", { name: /10 de outubro/ })).toBeDisabled();
    expect(screen.getByRole("button", { name: /30 de outubro/ })).toBeDisabled();
  });

  it("cancels without applying", async () => {
    const onValueChange = vi.fn();
    render(<PeriodFilter value={null} onValueChange={onValueChange} {...bounds} />);
    await userEvent.click(screen.getByRole("button", { name: "Período" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onValueChange).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("formatPeriodSummary", () => {
  it("formats presets and ranges", () => {
    expect(formatPeriodSummary({ preset: "all" })).toBe("Toda a viagem");
    expect(formatPeriodSummary({ preset: "custom", from: "2026-10-20", to: "2026-10-22" })).toBe(
      "20 a 22 out",
    );
    expect(formatPeriodSummary({ preset: "custom", from: "2026-09-28", to: "2026-10-02" })).toBe(
      "28 set a 2 out",
    );
    expect(formatPeriodSummary({ preset: "custom", from: "2026-10-20", to: "2026-10-20" })).toBe(
      "20 out",
    );
  });
});
