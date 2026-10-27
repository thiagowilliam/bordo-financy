import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { lisbonCategoryOptions } from "@/components/organisms/category-filter/category-filter.fixtures";

import { ExpenseFilterBar, type ExpenseFilterBarProps } from "./expense-filter-bar";

function setup(overrides: Partial<ExpenseFilterBarProps> = {}) {
  const props: ExpenseFilterBarProps = {
    search: "",
    onSearchChange: vi.fn(),
    categoryOptions: lisbonCategoryOptions,
    categories: [],
    onCategoriesChange: vi.fn(),
    period: null,
    onPeriodChange: vi.fn(),
    paymentMethod: undefined,
    onPaymentMethodChange: vi.fn(),
    onClear: vi.fn(),
    ...overrides,
  };
  render(<ExpenseFilterBar {...props} />);
  return props;
}

describe("ExpenseFilterBar", () => {
  it("renders search and the three filters without chips when nothing is active", () => {
    setup();
    expect(screen.getByRole("searchbox", { name: "Buscar lançamentos" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Categoria" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Período" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pagamento" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Limpar filtros" })).not.toBeInTheDocument();
  });

  it("renders a chip per active filter and the result summary", () => {
    setup({
      categories: ["food", "tours"],
      period: { preset: "custom", from: "2026-10-20", to: "2026-10-22" },
      paymentMethod: "CREDIT",
      result: { count: 12, totalInCents: 23450, currency: "EUR" },
    });
    expect(screen.getByText("Categoria: Alimentação, Passeios")).toBeInTheDocument();
    expect(screen.getByText("Período: 20 a 22 out")).toBeInTheDocument();
    expect(screen.getByText("Pagamento: Crédito")).toBeInTheDocument();
    expect(screen.getByText("12 lançamentos")).toBeInTheDocument();
    expect(screen.getByText("€ 234,50")).toBeInTheDocument();
  });

  it("removes each filter with its chip", async () => {
    const props = setup({
      categories: ["food"],
      period: { preset: "today" },
      paymentMethod: "PIX",
    });
    await userEvent.click(
      screen.getByRole("button", { name: "Remover filtro Categoria: Alimentação" }),
    );
    expect(props.onCategoriesChange).toHaveBeenCalledWith([]);
    await userEvent.click(screen.getByRole("button", { name: "Remover filtro Período: Hoje" }));
    expect(props.onPeriodChange).toHaveBeenCalledWith(null);
    await userEvent.click(screen.getByRole("button", { name: "Remover filtro Pagamento: Pix" }));
    expect(props.onPaymentMethodChange).toHaveBeenCalledWith(undefined);
  });

  it("clears all filters", async () => {
    const props = setup({ paymentMethod: "CASH" });
    await userEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(props.onClear).toHaveBeenCalledOnce();
  });

  it("reports search text", async () => {
    const props = setup();
    await userEvent.type(screen.getByRole("searchbox"), "p");
    expect(props.onSearchChange).toHaveBeenCalledWith("p");
  });
});
