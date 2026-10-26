import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { SegmentedControl } from "./segmented-control";

const options = [
  { value: "DAILY", label: "Dia a dia" },
  { value: "BASE", label: "Custo de base" },
];

function Harness({ onChange }: { onChange?: (value: string) => void }) {
  const [value, setValue] = useState("DAILY");
  return (
    <SegmentedControl
      aria-label="Tipo"
      options={options}
      value={value}
      onValueChange={(next) => {
        setValue(next);
        onChange?.(next);
      }}
    />
  );
}

describe("SegmentedControl", () => {
  it("is a radio group with the selected option checked", () => {
    render(<Harness />);
    expect(screen.getByRole("radiogroup", { name: "Tipo" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Dia a dia" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Custo de base" })).not.toBeChecked();
  });

  it("selects on click", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await userEvent.click(screen.getByRole("radio", { name: "Custo de base" }));
    expect(onChange).toHaveBeenCalledWith("BASE");
    expect(screen.getByRole("radio", { name: "Custo de base" })).toBeChecked();
  });

  it("moves with the arrow keys and wraps around", async () => {
    render(<Harness />);
    screen.getByRole("radio", { name: "Dia a dia" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Custo de base" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Custo de base" })).toHaveFocus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Dia a dia" })).toBeChecked();
  });

  it("only the selected option is in the tab order", () => {
    render(<Harness />);
    expect(screen.getByRole("radio", { name: "Custo de base" })).toHaveAttribute("tabindex", "-1");
  });
});
