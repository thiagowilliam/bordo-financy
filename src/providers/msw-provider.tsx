"use client";

import { useEffect, useState } from "react";

import { env } from "@/lib/env";

/** Starts the MSW service worker in development before rendering the app. */
export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!env.apiMocking);

  useEffect(() => {
    if (!env.apiMocking) return;
    let cancelled = false;
    import("@/mocks/browser")
      .then(({ worker }) => worker.start({ onUnhandledFrame: "bypass" }))
      .then(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready ? children : null;
}
