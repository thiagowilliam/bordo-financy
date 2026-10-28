import { randomUUID } from "node:crypto";

export type ImageExtension = "jpg" | "png" | "webp";

const EXTENSION_TYPES: Record<ImageExtension, string> = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

const UUID = "[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}";
const KEY = new RegExp(`^(trips|avatars)/${UUID}/${UUID}\\.(jpg|png|webp)$`);

/** `trips/<tripId>/<random>.jpg` or `avatars/<userId>/<random>.png`. The random part is not guessable. */
export const newStorageKey = (scope: "trips" | "avatars", ownerId: string, ext: ImageExtension) =>
  `${scope}/${ownerId}/${randomUUID()}.${ext}`;

/** Only keys made by `newStorageKey` pass. This is what keeps path traversal out of the disk driver. */
export const isStorageKey = (key: string) => KEY.test(key);

export const contentTypeOfKey = (key: string): string | null => {
  const ext = key.slice(key.lastIndexOf(".") + 1) as ImageExtension;
  return EXTENSION_TYPES[ext] ?? null;
};
