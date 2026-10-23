import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StatusBadge } from "./status-badge";

describe("StatusBadge", () => {
  it.each([
    ["ok", "Dentro do orçamento", "bg-success-soft"],
    ["warning", "Perto do limite", "bg-warning-soft"],
    ["over", "Acima do orçamento", "bg-destructive-soft"],
  ] as const)("renders the %s status", (status, label, tokenClass) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toHaveClass(tokenClass);
  });

  it("accepts a custom label", () => {
    render(<StatusBadge status="warning" label="82% usado" />);
    expect(screen.getByText("82% usado")).toBeInTheDocument();
  });
});
