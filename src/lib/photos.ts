export const MAX_PHOTOS = 10;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png"] as const;

export type PhotoFilterResult = {
  accepted: File[];
  /** True when at least one file had the wrong type or was too large. */
  hasInvalid: boolean;
  /** True when files were left out because the photo limit was reached. */
  hasOverflow: boolean;
};

/** Splits picked files into the ones the picker can take and what was ignored. */
export function filterPhotoFiles(files: File[], currentCount: number): PhotoFilterResult {
  const valid = files.filter(
    (file) =>
      (ACCEPTED_PHOTO_TYPES as readonly string[]).includes(file.type) &&
      file.size <= MAX_PHOTO_BYTES,
  );
  const room = Math.max(0, MAX_PHOTOS - currentCount);
  return {
    accepted: valid.slice(0, room),
    hasInvalid: valid.length < files.length,
    hasOverflow: valid.length > room,
  };
}
