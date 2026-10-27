"use client";

import type { KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

export type SegmentedControlOption = { value: string; label: string };

export type SegmentedControlProps = {
  options: SegmentedControlOption[];
  value: string;
  onValueChange: (value: string) => void;
  "aria-label": string;
  className?: string;
};

/** Pill switch between a few options, exposed as a radio group with arrow-key navigation. */
export function SegmentedControl({
  options,
  value,
  onValueChange,
  className,
  ...aria
}: SegmentedControlProps) {
  const hasSelection = options.some((option) => option.value === value);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === "ArrowRight" || event.key === "ArrowDown"
        ? 1
        : event.key === "ArrowLeft" || event.key === "ArrowUp"
          ? -1
          : 0;
    if (step === 0) return;
    event.preventDefault();
    const current = options.findIndex((option) => option.value === value);
    const next = options[(Math.max(current, 0) + step + options.length) % options.length];
    if (!next) return;
    onValueChange(next.value);
    const radios = event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]');
    radios[options.indexOf(next)]?.focus();
  };

  return (
    <div
      role="radiogroup"
      onKeyDown={handleKeyDown}
      className={cn("flex gap-1 rounded-lg bg-secondary p-1", className)}
      {...aria}
    >
      {options.map((option, index) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected || (!hasSelection && index === 0) ? 0 : -1}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "flex-1 rounded-md px-4 py-2.5 text-sm leading-[17px] outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "bg-card font-bold text-foreground shadow-[0_1px_4px_color-mix(in_oklch,var(--foreground)_10%,transparent)]"
                : "font-semibold text-muted-foreground hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
