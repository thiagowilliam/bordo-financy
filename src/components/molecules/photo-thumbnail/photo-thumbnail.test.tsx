import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PhotoThumbnail } from "./photo-thumbnail";

const base = { src: "blob:photo", alt: "praia.jpg", onSetCover: () => {}, onRemove: () => {} };

describe("PhotoThumbnail", () => {
  it("shows the cover tag instead of the set cover button on the cover", () => {
    render(<PhotoThumbnail {...base} isCover />);
    expect(screen.getByText("Capa")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Definir capa" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "praia.jpg" })).toHaveAttribute("src", "blob:photo");
  });

  it("offers to set another photo as cover", async () => {
    const onSetCover = vi.fn();
    render(<PhotoThumbnail {...base} isCover={false} onSetCover={onSetCover} />);
    await userEvent.click(screen.getByRole("button", { name: "Definir capa" }));
    expect(onSetCover).toHaveBeenCalledOnce();
  });

  it("removes the photo", async () => {
    const onRemove = vi.fn();
    render(<PhotoThumbnail {...base} isCover={false} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remover foto" }));
    expect(onRemove).toHaveBeenCalledOnce();
  });
});
