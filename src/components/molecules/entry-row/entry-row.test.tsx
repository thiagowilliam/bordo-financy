import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EntryRow, type EntryRowProps } from "./entry-row";

const base: EntryRowProps = {
  description: "Almoço no Time Out Market",
  categoryName: "Alimentação",
  categoryIcon: "utensils",
  categoryColor: 2,
  paymentMethod: "CREDIT",
  amountInCents: 2450,
  currency: "EUR",
};

describe("EntryRow", () => {
  it("shows title, category, payment label and amount", () => {
    render(<EntryRow {...base} />);
    expect(screen.getByText("Almoço no Time Out Market")).toHaveClass("truncate");
    expect(screen.getByText("Alimentação")).toBeInTheDocument();
    expect(screen.getByText("Crédito")).toBeInTheDocument();
    expect(screen.getByText("€ 24,50")).toBeInTheDocument();
  });

  it("tints the category tile", () => {
    const { container } = render(<EntryRow {...base} />);
    expect(container.querySelector(".bg-chart-2\\/13")).toBeInTheDocument();
  });

  it("renders no actions slot by default", () => {
    const { container } = render(<EntryRow {...base} />);
    expect(container.querySelector("[data-slot='entry-actions']")).not.toBeInTheDocument();
  });

  it("renders the actions slot revealed on hover and focus within", () => {
    const { container } = render(
      <EntryRow
        {...base}
        actions={
          <>
            <button type="button" aria-label="Editar lançamento" />
            <button type="button" aria-label="Excluir lançamento" />
          </>
        }
      />,
    );
    expect(screen.getByRole("button", { name: "Editar lançamento" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir lançamento" })).toBeInTheDocument();
    const slot = container.querySelector("[data-slot='entry-actions']");
    expect(slot).toHaveClass("group-hover:opacity-100", "group-focus-within:opacity-100");
  });
});
