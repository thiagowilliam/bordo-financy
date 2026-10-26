import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CostItemRow } from "./cost-item-row";

describe("CostItemRow", () => {
  it("shows description, paid label and formatted amount", () => {
    render(
      <CostItemRow
        description="Voo de ida"
        paidOnLabel="Pago em 14 jul"
        amountInCents={61240}
        currency="EUR"
      />,
    );
    expect(screen.getByText("Voo de ida")).toBeInTheDocument();
    expect(screen.getByText("Pago em 14 jul")).toBeInTheDocument();
    expect(screen.getByText("€ 612,40")).toBeInTheDocument();
  });
});
