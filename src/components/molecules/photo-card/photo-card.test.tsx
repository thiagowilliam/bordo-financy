import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PhotoCard } from "./photo-card";

const base = { src: "blob:photo", alt: "Praia", size: "grid" as const };

describe("PhotoCard", () => {
  it("renders the image with its alt", () => {
    render(<PhotoCard {...base} />);
    expect(screen.getByRole("img", { name: "Praia" })).toBeInTheDocument();
  });

  it("shows the cover badge only when it is the cover", () => {
    const { rerender } = render(<PhotoCard {...base} isCover />);
    expect(screen.getByText("Capa da viagem")).toBeInTheDocument();
    rerender(<PhotoCard {...base} />);
    expect(screen.queryByText("Capa da viagem")).not.toBeInTheDocument();
  });

  it("calls onSetCover from the hover pill", async () => {
    const onSetCover = vi.fn();
    render(<PhotoCard {...base} onSetCover={onSetCover} />);
    await userEvent.click(screen.getByRole("button", { name: "Definir como capa" }));
    expect(onSetCover).toHaveBeenCalledOnce();
  });

  it("sets the cover and deletes from the menu", async () => {
    const onSetCover = vi.fn();
    const onDelete = vi.fn();
    render(<PhotoCard {...base} onSetCover={onSetCover} onDelete={onDelete} />);
    await userEvent.click(screen.getByRole("button", { name: "Mais opções da foto" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Definir como capa" }));
    expect(onSetCover).toHaveBeenCalledOnce();

    await userEvent.click(screen.getByRole("button", { name: "Mais opções da foto" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Excluir foto" }));
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it("opens the menu with the keyboard and hides set cover on the cover", async () => {
    render(<PhotoCard {...base} isCover />);
    screen.getByRole("button", { name: "Mais opções da foto" }).focus();
    await userEvent.keyboard("{Enter}");
    expect(await screen.findByRole("menuitem", { name: "Excluir foto" })).toBeInTheDocument();
    expect(screen.queryByRole("menuitem", { name: "Definir como capa" })).not.toBeInTheDocument();
  });
});
