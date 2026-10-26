import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PaymentFilter } from "./payment-filter";

describe("PaymentFilter", () => {
  it("lists the five payment methods", async () => {
    render(<PaymentFilter value={undefined} onValueChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Pagamento" })).not.toHaveAttribute("data-active");
    await userEvent.click(screen.getByRole("button", { name: "Pagamento" }));
    expect(screen.getAllByRole("radio")).toHaveLength(5);
  });

  it("selects a single method and closes", async () => {
    const onValueChange = vi.fn();
    render(<PaymentFilter value={undefined} onValueChange={onValueChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Pagamento" }));
    await userEvent.click(screen.getByRole("radio", { name: "Crédito" }));
    expect(onValueChange).toHaveBeenCalledWith("CREDIT");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("marks the selected method, is active and clears", async () => {
    const onValueChange = vi.fn();
    render(<PaymentFilter value="PIX" onValueChange={onValueChange} />);
    const trigger = screen.getByRole("button", { name: "Pagamento" });
    expect(trigger).toHaveAttribute("data-active", "true");
    await userEvent.click(trigger);
    expect(screen.getByRole("radio", { name: "Pix" })).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(onValueChange).toHaveBeenCalledWith(undefined);
  });
});
