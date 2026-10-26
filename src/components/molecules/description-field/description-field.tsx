import { useId } from "react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type DescriptionFieldProps = React.ComponentProps<"textarea"> & {
  label?: string;
  /** Validation message shown under the field. */
  error?: string;
};

/** Optional free-text field with its label. Forwards `ref` (React 19) for react-hook-form. */
export function DescriptionField({
  label = "Descrição (opcional)",
  error,
  id: idProp,
  className,
  ...props
}: DescriptionFieldProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <Textarea
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "min-h-23 resize-none rounded-lg border-border bg-card px-4 py-3.5 text-[15px] leading-[1.4] text-foreground placeholder:text-subtle-foreground md:min-h-29 md:text-[15px]",
          className,
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
