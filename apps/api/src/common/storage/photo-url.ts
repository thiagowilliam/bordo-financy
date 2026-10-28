/**
 * Public URL of a stored photo. Rows hold either an absolute URL (a Google profile photo, the
 * development seed) or a storage key made by `newStorageKey`. Keys are served from
 * `MEDIA_BASE_URL`: the API's media route today, the bucket or CDN address in the cloud.
 */
export function toPhotoUrl(value: string | null): string | null {
  if (!value) return null;
  if (/^https?:\/\//.test(value)) return value;
  const base = (process.env.MEDIA_BASE_URL ?? "/api/media").replace(/\/+$/, "");
  return `${base}/${value}`;
}

/** True when the value is a file of ours (and so ours to delete), not someone else's URL. */
export const isOwnFile = (value: string | null): value is string =>
  value !== null && !/^https?:\/\//.test(value);
