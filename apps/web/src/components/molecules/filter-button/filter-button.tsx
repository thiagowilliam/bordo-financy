import { ChevronDown, ChevronUp } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type FilterButtonProps = Omit<React.ComponentProps<"button">, "children"> & {
  /** Rendered 16px icon element, e.g. `<Tag />`. */
  icon: ReactNode;
  label: string;
  /** Number of selected values, shown as a badge when above zero. */
  count?: number;
  /** True when the filter has a selection. */
  active?: boolean;
  /** True while the popover or sheet of this filter is open. */
  open?: boolean;
};

export function FilterButton({
  icon,
  label,
  count,
  active = false,
  open = false,
  className,
  type = "button",
  ...props
}: FilterButtonProps) {
  const Chevron = open ? ChevronUp : ChevronDown;
  return (
    <button
      type={type}
      aria-haspopup="dialog"
      aria-expanded={open}
      data-active={active || undefined}
      className={cn(
        "md:py-2.75-colors inline-flex min-w-0 items-center justify-center gap-1.5 rounded-lg border p-2.5 transition outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:gap-2 md:px-3.5",
        active
          ? "border-primary bg-primary-soft text-primary"
          : "border-border bg-card text-muted-foreground hover:bg-muted",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="hidden shrink-0 md:flex [&_svg]:size-4">
        {icon}
      </span>
      <span
        className={cn(
          "truncate text-[13px] font-semibold md:text-sm",
          active ? "text-primary-strong" : "text-foreground",
        )}
      >
        {label}
      </span>
      {count ? " " : null}
      {count ? (
        <span className="rounded-full bg-primary px-[7px] py-px text-[11px] font-bold text-primary-foreground">
          {count}
        </span>
      ) : null}
      <Chevron aria-hidden className="size-3.5 shrink-0 md:size-4" />
    </button>
  );
}
