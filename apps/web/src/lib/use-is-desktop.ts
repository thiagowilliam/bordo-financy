"use client";

import { useSyncExternalStore } from "react";

/** Tailwind `md` breakpoint. */
const DESKTOP_QUERY = "(min-width: 48rem)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const media = window.matchMedia(DESKTOP_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getSnapshot() {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  return window.matchMedia(DESKTOP_QUERY).matches;
}

/** True from the `md` breakpoint up. Defaults to desktop on the server and when matchMedia is missing. */
export function useIsDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, () => true);
}
