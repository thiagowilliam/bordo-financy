import { cn } from "@/lib/utils";

export type CategoryColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export const categoryFill: Record<CategoryColor, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
  6: "bg-chart-6",
  7: "bg-chart-7",
  8: "bg-chart-8",
};

export type CategoryBarProps = Omit<React.ComponentProps<"div">, "children" | "color"> & {
  /** Ratio between 0 and 1. Values outside the range are clamped. */
  progress: number;
  color: CategoryColor;
  /** Accessible name, e.g. "Passagem". */
  "aria-label": string;
};

/** Thin progress bar filled with a category color. */
export function CategoryBar({ progress, color, className, ...props }: CategoryBarProps) {
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
      <div
        className={cn("h-full rounded-full", categoryFill[color])}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
