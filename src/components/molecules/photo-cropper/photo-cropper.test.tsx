import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { cropImageToBlob } from "./crop-image";
import { clampCrop, getCropRect } from "./crop-math";
import { PhotoCropper } from "./photo-cropper";

describe("crop math", () => {
  const landscape = { width: 800, height: 600 };

  it("shows the centered square at zoom 1", () => {
    expect(getCropRect(landscape, { x: 0, y: 0, zoom: 1 })).toEqual({ sx: 100, sy: 0, side: 600 });
  });

  it("halves the source side at zoom 2", () => {
    expect(getCropRect(landscape, { x: 0, y: 0, zoom: 2 })).toEqual({
      sx: 250,
      sy: 150,
      side: 300,
    });
  });

  it("moves the source window opposite to the image offset", () => {
    const rect = getCropRect(landscape, { x: 0.1, y: 0, zoom: 2 });
    expect(rect.sx).toBeCloseTo(220);
  });

  it("clamps zoom and keeps the image covering the stage", () => {
    expect(clampCrop({ x: 5, y: 5, zoom: 10 }, landscape)).toEqual({ x: 1.5, y: 1, zoom: 3 });
    const flat = clampCrop({ x: 1, y: 1, zoom: 1 }, landscape);
    expect(flat.y).toBe(0);
    expect(flat.x).toBeCloseTo(1 / 6);
  });
});

describe("cropImageToBlob", () => {
  it("draws the computed region on the output canvas", async () => {
    const drawImage = vi.fn();
    const blob = new Blob(["x"], { type: "image/jpeg" });
    const toBlob = vi.fn((cb: BlobCallback) => cb(blob));
    const canvas = { width: 0, height: 0, getContext: () => ({ drawImage }), toBlob };
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) =>
      tag === "canvas" ? (canvas as unknown as HTMLCanvasElement) : realCreate(tag),
    );
    class FakeImage {
      naturalWidth = 800;
      naturalHeight = 600;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal("Image", FakeImage);

    const result = await cropImageToBlob("blob:x", { x: 0, y: 0, zoom: 2 }, 256);

    expect(result).toBe(blob);
    expect(canvas.width).toBe(256);
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 250, 150, 300, 300, 0, 0, 256, 256);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });
});

describe("PhotoCropper", () => {
  it("reports zoom changes from the slider", () => {
    const onCropChange = vi.fn();
    render(<PhotoCropper src="blob:x" onCropChange={onCropChange} />);
    fireEvent.change(screen.getByRole("slider", { name: "Zoom" }), { target: { value: "2" } });
    expect(onCropChange).toHaveBeenLastCalledWith({ x: 0, y: 0, zoom: 2 });
  });

  it("zooms with + and - and clamps at 1", async () => {
    const onCropChange = vi.fn();
    render(<PhotoCropper src="blob:x" onCropChange={onCropChange} />);
    screen.getByRole("group", { name: "Área de enquadramento da foto" }).focus();
    await userEvent.keyboard("+");
    expect(onCropChange).toHaveBeenLastCalledWith({ x: 0, y: 0, zoom: 1.1 });
    await userEvent.keyboard("--");
    expect(onCropChange).toHaveBeenLastCalledWith({ x: 0, y: 0, zoom: 1 });
  });

  it("moves with the arrow keys once zoomed", async () => {
    const onCropChange = vi.fn();
    render(
      <PhotoCropper
        src="blob:x"
        defaultCrop={{ x: 0, y: 0, zoom: 2 }}
        onCropChange={onCropChange}
      />,
    );
    screen.getByRole("group").focus();
    await userEvent.keyboard("{ArrowRight}");
    // Without a loaded image the offset is not clamped.
    expect(onCropChange).toHaveBeenLastCalledWith({ x: 0.02, y: 0, zoom: 2 });
  });
});
