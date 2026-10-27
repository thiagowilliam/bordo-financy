"use client";

import { useEffect, useState } from "react";

import { env } from "@/lib/env";

let startPromise: Promise<unknown> | undefined;

/** Starts the worker once; Strict Mode re-runs effects and MSW rejects a second start(). */
function startWorker() {
  startPromise ??= import("@/mocks/browser").then(({ worker }) =>
    worker.start({ onUnhandledFrame: "bypass" }),
  );
  return startPromise;
}

/** Starts the MSW service worker in development before rendering the app. */
export function MswProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!env.apiMocking);

  useEffect(() => {
    if (!env.apiMocking) return;
    let cancelled = false;
    startWorker().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready ? children : null;
}
