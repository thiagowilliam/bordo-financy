"use client";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export type UndoToastProps = Omit<React.ComponentProps<"div">, "children"> & {
  message: string;
  actionLabel?: string;
  onAction: () => void;
  /** Time left to undo, in milliseconds. Drives the bar. */
  durationMs: number;
};

/** Toast with an undo button and a bar that empties while the undo window is open. */
export function UndoToast({
  message,
  actionLabel = "Desfazer",
  onAction,
  durationMs,
  className,
  ...props
}: UndoToastProps) {
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setRunning(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      role="status"
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-popover md:w-90",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        <Trash2 aria-hidden="true" className="size-4.5 shrink-0 text-destructive-ink" />
        <span className="flex-1 text-sm font-semibold text-foreground">{message}</span>
        <button
          type="button"
          onClick={onAction}
          className="rounded-sm text-sm font-bold text-primary outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {actionLabel}
        </button>
      </div>
      <div aria-hidden="true" className="h-1 bg-muted">
        <div
          data-testid="undo-bar"
          className="h-full origin-left bg-primary ease-linear"
          style={{
            transform: running ? "scaleX(0)" : "scaleX(1)",
            transition: `transform ${durationMs}ms linear`,
          }}
        />
      </div>
    </div>
  );
}
