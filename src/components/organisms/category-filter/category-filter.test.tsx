import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CategoryFilter } from "./category-filter";
import { lisbonCategoryOptions } from "./category-filter.fixtures";

afterEach(() => vi.unstubAllGlobals());

describe("CategoryFilter", () => {
  it("is inactive without selection and active with a count badge", () => {
    const { rerender } = render(
      <CategoryFilter options={lisbonCategoryOptions} value={[]} onValueChange={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Categoria" })).not.toHaveAttribute("data-active");
    rerender(
      <CategoryFilter
        options={lisbonCategoryOptions}
        value={["food", "tours"]}
        onValueChange={() => {}}
      />,
    );
    const trigger = screen.getByRole("button", { name: "Categoria 2" });
    expect(trigger).toHaveAttribute("data-active", "true");
  });

  it("stages the selection and commits it on Aplicar", async () => {
    const onValueChange = vi.fn();
    render(
      <CategoryFilter options={lisbonCategoryOptions} value={[]} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Categoria" }));
    await userEvent.click(screen.getByRole("checkbox", { name: /Alimentação/ }));
    await userEvent.click(screen.getByRole("checkbox", { name: /Passeios/ }));
    expect(screen.getByRole("checkbox", { name: /Passeios/ })).toBeChecked();
    expect(onValueChange).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(onValueChange).toHaveBeenCalledWith(["food", "tours"]);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("discards staged changes when closed without applying", async () => {
    const onValueChange = vi.fn();
    render(
      <CategoryFilter
        options={lisbonCategoryOptions}
        value={["food"]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Categoria 1" }));
    await userEvent.click(screen.getByRole("checkbox", { name: /Passeios/ }));
    await userEvent.keyboard("{Escape}");
    await userEvent.click(screen.getByRole("button", { name: "Categoria 1" }));
    expect(screen.getByRole("checkbox", { name: /Passeios/ })).not.toBeChecked();
    expect(screen.getByRole("checkbox", { name: /Alimentação/ })).toBeChecked();
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("clears the staged selection with Limpar seleção", async () => {
    const onValueChange = vi.fn();
    render(
      <CategoryFilter
        options={lisbonCategoryOptions}
        value={["food"]}
        onValueChange={onValueChange}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Categoria 1" }));
    await userEvent.click(screen.getByRole("button", { name: "Limpar seleção" }));
    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(onValueChange).toHaveBeenCalledWith([]);
  });

  it("filters options by the search field", async () => {
    render(<CategoryFilter options={lisbonCategoryOptions} value={[]} onValueChange={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Categoria" }));
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar categoria" }), "combu");
    const group = screen.getByRole("group", { name: "Categorias" });
    expect(within(group).getAllByRole("checkbox")).toHaveLength(1);
    expect(within(group).getByRole("checkbox", { name: /Combustível/ })).toBeInTheDocument();
  });

  it("renders a bottom sheet with a full width Aplicar below md", async () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    );
    const onValueChange = vi.fn();
    render(
      <CategoryFilter options={lisbonCategoryOptions} value={[]} onValueChange={onValueChange} />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Categoria" }));
    expect(screen.queryByRole("button", { name: "Limpar seleção" })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("checkbox", { name: /Saúde/ }));
    await userEvent.click(screen.getByRole("button", { name: "Aplicar" }));
    expect(onValueChange).toHaveBeenCalledWith(["health"]);
  });
});
