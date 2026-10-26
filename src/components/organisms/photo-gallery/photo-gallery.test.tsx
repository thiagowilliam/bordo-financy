import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PhotoGallery, type GalleryPhoto, type PhotoGalleryProps } from "./photo-gallery";

const photos: GalleryPhoto[] = Array.from({ length: 5 }, (_, i) => ({
  id: `p${i}`,
  url: `blob:photo-${i}`,
  alt: `Foto ${i}`,
  isCover: i === 0,
}));

const base: PhotoGalleryProps = {
  photos,
  canAdd: true,
  onAddFiles: () => {},
  onSetCover: () => {},
  onDelete: () => {},
};

describe("PhotoGallery", () => {
  it("renders a labelled list with one item per photo plus the add tile", () => {
    render(<PhotoGallery {...base} />);
    const list = screen.getByRole("list", { name: "Fotos da viagem" });
    expect(within(list).getAllByRole("listitem")).toHaveLength(6);
  });

  it("shows the cover badge only once", () => {
    render(<PhotoGallery {...base} />);
    expect(screen.getAllByText("Capa da viagem")).toHaveLength(1);
  });

  it("hides the add tile when canAdd is false", () => {
    render(<PhotoGallery {...base} canAdd={false} />);
    expect(screen.queryByRole("button", { name: /Adicionar fotos/ })).not.toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
  });

  it("renders only the add tile when empty", () => {
    render(<PhotoGallery {...base} photos={[]} />);
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Adicionar fotos/ })).toBeInTheDocument();
  });

  it("passes the photo id to set cover and delete", async () => {
    const onSetCover = vi.fn();
    const onDelete = vi.fn();
    render(<PhotoGallery {...base} onSetCover={onSetCover} onDelete={onDelete} />);
    const item = screen.getByRole("img", { name: "Foto 2" }).closest("li")!;
    await userEvent.click(within(item).getByRole("button", { name: "Definir como capa" }));
    expect(onSetCover).toHaveBeenCalledWith("p2");
    await userEvent.click(within(item).getByRole("button", { name: "Mais opções da foto" }));
    await userEvent.click(await screen.findByRole("menuitem", { name: "Excluir foto" }));
    expect(onDelete).toHaveBeenCalledWith("p2");
  });
});
