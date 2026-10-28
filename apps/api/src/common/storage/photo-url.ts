/**
 * Public URL of a stored photo. Rows hold an absolute URL (the development seed) or an object
 * storage key. Keys have no public base yet: they arrive with the photos module and its storage.
 */
export function toPhotoUrl(storageKey: string | null): string | null {
  if (!storageKey) return null;
  return /^https?:\/\//.test(storageKey) ? storageKey : null;
}
