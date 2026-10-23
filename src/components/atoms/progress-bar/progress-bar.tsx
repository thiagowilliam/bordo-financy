import { cva } from "class-variance-authority";

import type { BudgetStatus } from "@/lib/budget";
import { cn } from "@/lib/utils";

const fillVariants = cva("h-full rounded-full", {
  variants: {
    status: { ok: "bg-success", warning: "bg-warning", over: "bg-destructive" },
  },
  defaultVariants: { status: "ok" },
});

export type ProgressBarProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Ratio between 0 and 1. Values outside the range are clamped. */
  progress: number;
  status?: BudgetStatus;
  /** Accessible name, e.g. "Orçamento usado". */
  "aria-label": string;
};

export function ProgressBar({ progress, status = "ok", className, ...props }: ProgressBarProps) {
  const ratio = Math.min(Math.max(progress, 0), 1);
  const percent = Math.round(ratio * 100);
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <div className={fillVariants({ status })} style={{ width: `${percent}%` }} />
    </div>
  );
}
