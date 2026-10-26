import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { CategoryPicker, type CategoryPickerOption } from "./category-picker";

const categories: CategoryPickerOption[] = [
  { id: "food", name: "Alimentação", icon: "utensils", color: 1, usageCount: 12 },
  { id: "tours", name: "Passeios", icon: "camera", color: 2, usageCount: 5 },
  { id: "transport", name: "Transporte", icon: "bus", color: 3, usageCount: 5 },
  { id: "shopping", name: "Compras", icon: "shopping-bag", color: 4, usageCount: 3 },
  { id: "fuel", name: "Combustível", icon: "fuel", color: 5, usageCount: 2 },
  { id: "tips", name: "Gorjetas", icon: "coins", color: 6, usageCount: 3 },
  { id: "health", name: "Saúde e outros", icon: "heart-pulse", color: 7, usageCount: 1 },
];

function Harness({
  initial,
  onChange,
  onCreateCategory,
  isCreating,
}: {
  initial?: string;
  onChange?: (id: string) => void;
  onCreateCategory?: React.ComponentProps<typeof CategoryPicker>["onCreateCategory"];
  isCreating?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <CategoryPicker
      value={value}
      categories={categories}
      onValueChange={(id) => {
        setValue(id);
        onChange?.(id);
      }}
      onCreateCategory={onCreateCategory}
      isCreating={isCreating}
    />
  );
}

const open = () => userEvent.click(screen.getByRole("button", { name: /^Categoria/ }));

describe("CategoryPicker", () => {
  it("shows the placeholder, then the selected category on the trigger", () => {
    render(<Harness initial="food" />);
    expect(screen.getByRole("button", { name: "Categoria Alimentação" })).toBeInTheDocument();
  });

  it("lists the top 3 as most used, then the rest", async () => {
    render(<Harness />);
    await open();
    expect(screen.getByText("MAIS USADAS")).toBeInTheDocument();
    expect(screen.getByText("TODAS")).toBeInTheDocument();
    const options = screen.getAllByRole("option").map((option) => option.textContent);
    expect(options.slice(0, 3)).toEqual(["Alimentação", "Passeios", "Transporte"]);
    expect(options.slice(3)).toEqual(["Compras", "Combustível", "Gorjetas", "Saúde e outros"]);
  });

  it("filters ignoring accents and hides the hints while searching", async () => {
    render(<Harness />);
    await open();
    await userEvent.type(screen.getByRole("combobox", { name: "Buscar categoria" }), "alimentacao");
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(1);
    expect(options[0]).toHaveTextContent("Alimentação");
    expect(screen.queryByText("MAIS USADAS")).not.toBeInTheDocument();
  });

  it("shows an empty message when nothing matches", async () => {
    render(<Harness />);
    await open();
    await userEvent.type(screen.getByRole("combobox"), "zzz");
    expect(screen.getByText("Nenhuma categoria encontrada")).toBeInTheDocument();
  });

  it("selects with a click and closes", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await open();
    await userEvent.click(screen.getByRole("option", { name: "Compras" }));
    expect(onChange).toHaveBeenCalledWith("shopping");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Categoria Compras" })).toBeInTheDocument();
  });

  it("selects with the keyboard", async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await open();
    await userEvent.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("tours");
  });

  it("closes with Escape", async () => {
    render(<Harness />);
    await open();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("marks the selected option", async () => {
    render(<Harness initial="tours" />);
    await open();
    expect(screen.getByRole("option", { name: /Passeios/ })).toHaveTextContent("(selecionada)");
  });

  it("hides the create row without onCreateCategory", async () => {
    render(<Harness />);
    await open();
    expect(screen.queryByRole("option", { name: "Nova categoria" })).not.toBeInTheDocument();
  });

  it("creates a category and returns to the list", async () => {
    const onCreateCategory = vi.fn().mockResolvedValue(undefined);
    render(<Harness onCreateCategory={onCreateCategory} />);
    await open();
    await userEvent.click(screen.getByRole("option", { name: "Nova categoria" }));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByRole("heading", { name: "Nova categoria" })).toBeInTheDocument();
    const create = within(dialog).getByRole("button", { name: "Criar" });
    expect(create).toBeDisabled();

    await userEvent.type(within(dialog).getByLabelText("Nome"), "Farmácia");
    await userEvent.click(within(dialog).getByRole("button", { name: "Livros" }));
    expect(within(dialog).getByRole("button", { name: "Livros" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await userEvent.click(create);

    expect(onCreateCategory).toHaveBeenCalledWith({ name: "Farmácia", icon: "book-open" });
    expect(await screen.findByRole("combobox", { name: "Buscar categoria" })).toBeInTheDocument();
  });

  it("goes back to the list with Cancelar", async () => {
    render(<Harness onCreateCategory={vi.fn()} />);
    await open();
    await userEvent.click(screen.getByRole("option", { name: "Nova categoria" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(screen.getByRole("combobox", { name: "Buscar categoria" })).toBeInTheDocument();
  });

  it("disables Criar while creating", async () => {
    render(<Harness onCreateCategory={vi.fn()} isCreating />);
    await open();
    await userEvent.click(screen.getByRole("option", { name: "Nova categoria" }));
    await userEvent.type(screen.getByLabelText("Nome"), "Farmácia");
    expect(screen.getByRole("button", { name: "Criando..." })).toBeDisabled();
  });
});
