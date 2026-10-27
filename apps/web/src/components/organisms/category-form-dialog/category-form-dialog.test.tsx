import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CategoryFormDialog, type CategoryFormDialogProps } from "./category-form-dialog";

function setup(props: Partial<CategoryFormDialogProps> = {}) {
  const onSubmit = vi.fn();
  const onOpenChange = vi.fn();
  render(
    <CategoryFormDialog
      open
      onOpenChange={onOpenChange}
      onSubmit={onSubmit}
      mode="create"
      previewSubtitle="2 lançamentos · Dia a dia"
      {...props}
    />,
  );
  return { onSubmit, onOpenChange };
}

const save = () => screen.getByRole("button", { name: /Salv/ });

describe("CategoryFormDialog", () => {
  it("shows the title per mode", () => {
    setup({ mode: "edit", initialValues: { name: "Passeios", icon: "ticket", color: 2 } });
    expect(screen.getByRole("dialog", { name: "Editar categoria" })).toBeInTheDocument();
  });

  it("disables Salvar while the name is empty", async () => {
    setup();
    expect(save()).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Nome"), "  ");
    expect(save()).toBeDisabled();
    await userEvent.type(screen.getByLabelText("Nome"), "Farmácia");
    expect(save()).toBeEnabled();
  });

  it("updates the preview live and falls back to Nova categoria", async () => {
    setup();
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("2 lançamentos · Dia a dia");
    expect(dialog).toHaveTextContent("Prévia");
    await userEvent.type(screen.getByLabelText("Nome"), "Farmácia");
    expect(screen.getByText("Farmácia", { selector: "span" })).toBeInTheDocument();
  });

  it("selects icon and color and submits the payload", async () => {
    const { onSubmit } = setup();
    await userEvent.type(screen.getByLabelText("Nome"), " Farmácia ");
    await userEvent.click(screen.getByRole("radio", { name: "pill" }));
    await userEvent.click(screen.getByRole("radio", { name: "Cor 5" }));
    expect(screen.getByRole("radio", { name: "pill" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Cor 5" })).toBeChecked();
    await userEvent.click(save());
    expect(onSubmit).toHaveBeenCalledWith({ name: "Farmácia", icon: "pill", color: 5 });
  });

  it("renders 24 icons and 8 colors", () => {
    setup();
    expect(
      screen.getByRole("radiogroup", { name: "Ícone" }).querySelectorAll("button"),
    ).toHaveLength(24);
    expect(screen.getByRole("radiogroup", { name: "Cor" }).querySelectorAll("button")).toHaveLength(
      8,
    );
  });

  it("moves selection with arrow keys in the radiogroups", async () => {
    setup();
    screen.getByRole("radio", { name: "utensils" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "coffee" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "coffee" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("radio", { name: "landmark" })).toBeChecked();
    screen.getByRole("radio", { name: "Cor 1" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("radio", { name: "Cor 4" })).toBeChecked();
  });

  it("shows the error under the name", () => {
    setup({ error: "Nome já existe" });
    expect(screen.getByText("Nome já existe")).toBeInTheDocument();
    expect(screen.getByLabelText("Nome")).toHaveAttribute("aria-invalid", "true");
  });

  it("shows the pending state", () => {
    setup({ initialValues: { name: "A", icon: "utensils", color: 1 }, isPending: true });
    expect(screen.getByRole("button", { name: "Salvando..." })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled();
  });

  it("closes on Escape and Cancelar", async () => {
    const { onOpenChange } = setup();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
    onOpenChange.mockClear();
    await userEvent.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("resets the draft when it reopens", async () => {
    const props = {
      onOpenChange: vi.fn(),
      onSubmit: vi.fn(),
      mode: "create",
      previewSubtitle: "",
    } as const;
    const { rerender } = render(<CategoryFormDialog open {...props} />);
    await userEvent.type(screen.getByLabelText("Nome"), "Rascunho");
    rerender(<CategoryFormDialog open={false} {...props} />);
    rerender(<CategoryFormDialog open {...props} />);
    expect(screen.getByLabelText("Nome")).toHaveValue("");
  });
});
