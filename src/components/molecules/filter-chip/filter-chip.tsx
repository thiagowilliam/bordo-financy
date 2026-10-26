import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export type FilterChipProps = Omit<React.ComponentProps<"span">, "children"> & {
  label: string;
  /** Shorter text shown below md; the full label stays as the accessible name. */
  compactLabel?: string;
  onRemove: () => void;
};

export function FilterChip({
  label,
  compactLabel,
  onRemove,
  className,
  ...props
}: FilterChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-primary-soft py-1.5 pr-2 pl-3",
        className,
      )}
      {...props}
    >
      {compactLabel ? (
        <span aria-hidden className="text-[13px] font-semibold text-primary-strong md:hidden">
          {compactLabel}
        </span>
      ) : null}
      <span
        className={cn(
          "text-[13px] font-semibold text-primary-strong",
          compactLabel && "max-md:sr-only",
        )}
      >
        {label}
      </span>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remover filtro ${label}`}
        className="flex rounded-full text-primary-strong outline-none hover:text-primary focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <X aria-hidden className="size-3.5" />
      </button>
    </span>
  );
}
