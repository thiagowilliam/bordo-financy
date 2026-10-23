import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const fieldControlClassName =
  "h-auto rounded-lg border-border bg-card px-4 py-3.75 text-base text-foreground placeholder:text-subtle-foreground md:text-base";

export type TextFieldProps = React.ComponentProps<"input"> & {
  /** Rendered icon shown at the start of the field, e.g. `<MapPin />`. Decorative. */
  icon?: React.ReactNode;
  /** Classes for the wrapper around the input. */
  wrapperClassName?: string;
};

/** Text input with an optional decorative leading icon. */
export function TextField({ icon, className, wrapperClassName, ...props }: TextFieldProps) {
  return (
    <div className={cn("relative", wrapperClassName)}>
      {icon ? (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-subtle-foreground [&_svg:not([class*='size-'])]:size-4.5"
        >
          {icon}
        </span>
      ) : null}
      <Input className={cn(fieldControlClassName, icon && "pl-11.5", className)} {...props} />
    </div>
  );
}
