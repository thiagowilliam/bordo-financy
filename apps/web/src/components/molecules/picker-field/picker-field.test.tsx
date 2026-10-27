import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import { PickerField } from "./picker-field";

describe("PickerField", () => {
  it("is named by label and value", () => {
    render(<PickerField label="Categoria" valueLabel="Alimentação" />);
    expect(screen.getByRole("button", { name: "Categoria Alimentação" })).toBeInTheDocument();
  });

  it("shows the placeholder when empty", () => {
    render(<PickerField label="Categoria" placeholder="Escolha" />);
    expect(screen.getByRole("button", { name: "Categoria Escolha" })).toBeInTheDocument();
  });

  it("hides the icon from assistive tech", () => {
    render(<PickerField label="Data" icon={<svg data-testid="icon" />} />);
    expect(screen.getByTestId("icon").parentElement).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards ref, aria props and clicks", async () => {
    const ref = createRef<HTMLButtonElement>();
    const onClick = vi.fn();
    render(
      <PickerField
        ref={ref}
        label="Data"
        aria-haspopup="dialog"
        aria-expanded={false}
        onClick={onClick}
      />,
    );
    const button = screen.getByRole("button");
    expect(ref.current).toBe(button);
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("shows the error and marks the button invalid", () => {
    render(<PickerField label="Data" error="Escolha uma data" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Escolha uma data");
    expect(screen.getByRole("button")).toHaveAccessibleDescription("Escolha uma data");
  });
});
