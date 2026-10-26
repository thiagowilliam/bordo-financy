import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { FilterChip } from "./filter-chip";

describe("FilterChip", () => {
  it("renders the label and removes through the button", async () => {
    const onRemove = vi.fn();
    render(<FilterChip label="Pagamento: Crédito" onRemove={onRemove} />);
    expect(screen.getByText("Pagamento: Crédito")).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Remover filtro Pagamento: Crédito" }),
    );
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
