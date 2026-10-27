import { getCropRect, type CropState } from "./crop-math";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the image"));
    image.src = src;
  });
}

/** Draws the framed square of `src` on a canvas and returns it as a JPEG blob. */
export async function cropImageToBlob(
  src: string,
  crop: CropState,
  outputSize = 512,
): Promise<Blob> {
  const image = await loadImage(src);
  const { sx, sy, side } = getCropRect(
    { width: image.naturalWidth, height: image.naturalHeight },
    crop,
  );
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported");
  context.drawImage(image, sx, sy, side, side, 0, 0, outputSize, outputSize);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not export the image"))),
      "image/jpeg",
      0.9,
    );
  });
}
