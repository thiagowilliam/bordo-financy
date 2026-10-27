export type CropState = {
  /** Horizontal offset of the image center from the stage center, as a fraction of the stage side. */
  x: number;
  /** Vertical offset, same unit as `x`. */
  y: number;
  /** 1 fits the shorter image side to the stage; larger values zoom in. */
  zoom: number;
};

export type ImageSize = { width: number; height: number };

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 3;
export const INITIAL_CROP: CropState = { x: 0, y: 0, zoom: 1 };

/** Displayed image size as a fraction of the stage side. */
export function getDisplaySize(image: ImageSize, zoom: number) {
  const shorter = Math.min(image.width, image.height);
  return { width: (image.width / shorter) * zoom, height: (image.height / shorter) * zoom };
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** Keeps the zoom in range and the image covering the whole stage. */
export function clampCrop(crop: CropState, image: ImageSize): CropState {
  const zoom = clamp(crop.zoom, MIN_ZOOM, MAX_ZOOM);
  const display = getDisplaySize(image, zoom);
  const maxX = (display.width - 1) / 2;
  const maxY = (display.height - 1) / 2;
  return { zoom, x: clamp(crop.x, -maxX, maxX), y: clamp(crop.y, -maxY, maxY) };
}

/** Square region of the source image, in natural pixels, that the stage shows. */
export function getCropRect(image: ImageSize, crop: CropState) {
  const safe = clampCrop(crop, image);
  const side = Math.min(image.width, image.height) / safe.zoom;
  const centerX = image.width / 2 - safe.x * side;
  const centerY = image.height / 2 - safe.y * side;
  return { sx: centerX - side / 2, sy: centerY - side / 2, side };
}
