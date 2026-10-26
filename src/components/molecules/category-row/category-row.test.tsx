import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CategoryRow, type CategoryRowProps } from "./category-row";

function setup(props: Partial<CategoryRowProps> = {}) {
  const handlers = { onEdit: vi.fn(), onToggleHidden: vi.fn(), onDelete: vi.fn() };
  render(
    <CategoryRow
      name="Alimentação"
      icon="utensils"
      color={1}
      isDefault
      usageCount={12}
      totalInCents={41230}
      currency="EUR"
      {...handlers}
      {...props}
    />,
  );
  return handlers;
}

describe("CategoryRow", () => {
  it("shows the default badge and the plural count", () => {
    setup();
    expect(screen.getByText("Padrão")).toBeInTheDocument();
    expect(screen.queryByText("Oculta")).not.toBeInTheDocument();
    expect(screen.getAllByText(/12 lançamentos/).length).toBeGreaterThan(0);
  });

  it("uses the singular for one expense", () => {
    setup({ usageCount: 1 });
    expect(screen.getAllByText(/1 lançamento(?!s)/).length).toBeGreaterThan(0);
  });

  it("default category: edit and hide, no delete", async () => {
    const { onEdit, onToggleHidden } = setup();
    expect(screen.queryByRole("button", { name: "Excluir categoria" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Editar categoria" }));
    await userEvent.click(screen.getByRole("button", { name: "Ocultar categoria" }));
    expect(onEdit).toHaveBeenCalledOnce();
    expect(onToggleHidden).toHaveBeenCalledOnce();
  });

  it("custom category: edit and delete, no hide", async () => {
    const { onDelete } = setup({ isDefault: false });
    expect(screen.queryByText("Padrão")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Ocultar categoria" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Excluir categoria" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("hidden category shows the badge and the show action", () => {
    setup({ hidden: true });
    expect(screen.getByText("Oculta")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mostrar categoria" })).toBeInTheDocument();
  });
});
