import { Injectable, UnprocessableEntityException } from "@nestjs/common";
import sharp from "sharp";

import type { ImageExtension } from "./storage-key.js";

export type ImageFormat = "jpeg" | "png" | "webp";

export interface ProcessedImage {
  body: Buffer;
  extension: ImageExtension;
  contentType: string;
  width: number;
  height: number;
}

const FORMATS: Record<ImageFormat, { extension: ImageExtension; contentType: string }> = {
  jpeg: { extension: "jpg", contentType: "image/jpeg" },
  png: { extension: "png", contentType: "image/png" },
  webp: { extension: "webp", contentType: "image/webp" },
};

/** Longest side kept. Phone photos are bigger than any screen needs. */
const MAX_SIDE = 2560;
/** Refuses decompression bombs: a tiny file that expands to gigabytes of pixels. */
const MAX_PIXELS = 50_000_000;
const INVALID = "O arquivo não é uma imagem válida.";

@Injectable()
export class ImageService {
  /**
   * Decodes the upload for real (the content type the client claims is not trusted), keeps only the
   * `allowed` formats, turns it upright, shrinks it to `MAX_SIDE` and writes it again in the same
   * format. Writing it again drops the metadata, which for a travel photo includes the GPS position.
   */
  async process(input: Buffer, allowed: readonly ImageFormat[]): Promise<ProcessedImage> {
    try {
      const format = (await sharp(input, { limitInputPixels: MAX_PIXELS }).metadata()).format as
        ImageFormat | undefined;
      if (!format || !(format in FORMATS)) throw new UnprocessableEntityException(INVALID);
      if (!allowed.includes(format)) {
        throw new UnprocessableEntityException("Formato de imagem não aceito.");
      }

      const { data, info } = await sharp(input, { limitInputPixels: MAX_PIXELS })
        .autoOrient()
        .resize({ width: MAX_SIDE, height: MAX_SIDE, fit: "inside", withoutEnlargement: true })
        .toFormat(format, { quality: 90 })
        .toBuffer({ resolveWithObject: true });

      return { body: data, width: info.width, height: info.height, ...FORMATS[format] };
    } catch (error) {
      if (error instanceof UnprocessableEntityException) throw error;
      throw new UnprocessableEntityException(INVALID);
    }
  }
}
