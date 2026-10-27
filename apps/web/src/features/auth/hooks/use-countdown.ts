"use client";

import { useEffect, useState } from "react";

/** Seconds left until `start()` runs out, ticking once a second. */
export function useCountdown() {
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setTimeout(() => setRemaining((seconds) => seconds - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  return { remaining, start: (seconds: number) => setRemaining(seconds) };
}

/** 45 becomes "0:45". */
export const formatCountdown = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
