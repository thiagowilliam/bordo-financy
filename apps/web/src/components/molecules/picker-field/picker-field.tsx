import { ChevronDown } from "lucide-react";
import { useId, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type PickerFieldProps = Omit<React.ComponentProps<"button">, "children"> & {
  label: string;
  /** Rendered leading icon (decorative), e.g. `<Calendar />`. */
  icon?: ReactNode;
  /** Text of the current value. Shows the placeholder when empty. */
  valueLabel?: string;
  placeholder?: string;
  /** Validation message shown under the field. */
  error?: string;
};

/**
 * Select-like field: label plus a button showing the current value. Forwards its ref and props so
 * it works as a `PopoverTrigger asChild` / `SheetTrigger asChild`.
 */
export function PickerField({
  label,
  icon,
  valueLabel,
  placeholder = "Selecionar",
  error,
  id: idProp,
  className,
  ref,
  ...props
}: PickerFieldProps) {
  const generatedId = useId();
  const id = idProp ?? `${generatedId}-button`;
  const labelId = `${generatedId}-label`;
  const valueId = `${generatedId}-value`;
  const errorId = `${generatedId}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <span id={labelId} className="text-sm font-semibold text-foreground">
        {label}
      </span>
      <button
        ref={ref}
        id={id}
        type="button"
        aria-labelledby={`${labelId} ${valueId}`}
        data-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "flex min-h-12 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2.5 text-left outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[invalid=true]:border-destructive data-[invalid=true]:ring-3 data-[invalid=true]:ring-destructive/20",
          className,
        )}
        {...props}
      >
        {icon ? (
          <span
            aria-hidden
            className="flex shrink-0 items-center text-subtle-foreground [&_svg:not([class*='size-'])]:size-4.5"
          >
            {icon}
          </span>
        ) : null}
        <span
          id={valueId}
          className={cn(
            "min-w-0 flex-1 truncate text-[15px] leading-[18px] font-medium",
            valueLabel ? "text-foreground" : "text-subtle-foreground",
          )}
        >
          {valueLabel || placeholder}
        </span>
        <ChevronDown aria-hidden className="size-4.5 shrink-0 text-subtle-foreground" />
      </button>
      {error ? (
        <p id={errorId} role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
