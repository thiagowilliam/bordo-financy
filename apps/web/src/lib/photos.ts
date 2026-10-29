import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  PHOTO_TYPES,
} from "@bordo/shared/photos";

// The limits live in the shared package: the API enforces the same numbers.
export { AVATAR_MAX_BYTES, MAX_PHOTO_BYTES, MAX_PHOTOS };
export const ACCEPTED_PHOTO_TYPES = PHOTO_TYPES;

export type PhotoFilterResult = {
  accepted: File[];
  /** True when at least one file had the wrong type or was too large. */
  hasInvalid: boolean;
  /** True when files were left out because the photo limit was reached. */
  hasOverflow: boolean;
};

/** Splits picked files into the ones the picker can take and what was ignored. */
export function filterPhotoFiles(
  files: File[],
  currentCount: number,
  maxPhotos: number = MAX_PHOTOS,
): PhotoFilterResult {
  const valid = files.filter(
    (file) =>
      (ACCEPTED_PHOTO_TYPES as readonly string[]).includes(file.type) &&
      file.size <= MAX_PHOTO_BYTES,
  );
  const room = Math.max(0, maxPhotos - currentCount);
  return {
    accepted: valid.slice(0, room),
    hasInvalid: valid.length < files.length,
    hasOverflow: valid.length > room,
  };
}

export const AVATAR_ACCEPTED_TYPES = AVATAR_TYPES;

/** True when the file is a JPG, PNG or WEBP of up to 5 MB. */
export function isValidAvatarFile(file: File): boolean {
  return (
    (AVATAR_ACCEPTED_TYPES as readonly string[]).includes(file.type) &&
    file.size <= AVATAR_MAX_BYTES
  );
}
