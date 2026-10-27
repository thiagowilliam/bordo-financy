import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PhotoDropzone } from "./photo-dropzone";

const image = new File(["x"], "praia.jpg", { type: "image/jpeg" });

describe("PhotoDropzone", () => {
  it("has a real multiple file input restricted to JPG and PNG", () => {
    render(<PhotoDropzone onFilesSelected={() => {}} />);
    const input = screen.getByLabelText("Escolher fotos");
    expect(input).toHaveAttribute("type", "file");
    expect(input).toHaveAttribute("multiple");
    expect(input).toHaveAttribute("accept", "image/jpeg,image/png");
  });

  it("reports files chosen in the picker", async () => {
    const onFilesSelected = vi.fn();
    render(<PhotoDropzone onFilesSelected={onFilesSelected} />);
    await userEvent.upload(screen.getByLabelText("Escolher fotos"), image);
    expect(onFilesSelected).toHaveBeenCalledWith([image]);
  });

  it("reports dropped files", () => {
    const onFilesSelected = vi.fn();
    const { container } = render(<PhotoDropzone onFilesSelected={onFilesSelected} />);
    fireEvent.drop(container.querySelector("label")!, { dataTransfer: { files: [image] } });
    expect(onFilesSelected).toHaveBeenCalledWith([image]);
  });

  it("ignores drops when disabled", () => {
    const onFilesSelected = vi.fn();
    const { container } = render(<PhotoDropzone disabled onFilesSelected={onFilesSelected} />);
    fireEvent.drop(container.querySelector("label")!, { dataTransfer: { files: [image] } });
    expect(onFilesSelected).not.toHaveBeenCalled();
  });
});
