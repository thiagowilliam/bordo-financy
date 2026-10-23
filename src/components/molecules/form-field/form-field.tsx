import { useId } from "react";

import { cn } from "@/lib/utils";

export type FormFieldControlProps = {
  id: string;
  "aria-invalid": boolean | undefined;
  "aria-describedby": string | undefined;
};

export type FormFieldProps = Omit<React.ComponentProps<"div">, "children"> & {
  label: string;
  /** Validation message shown under the control. */
  error?: string;
  /** Helper text shown under the control when there is no error. */
  hint?: string;
  /** Receives the props that wire the control to the label, error and hint. */
  children: (control: FormFieldControlProps) => React.ReactNode;
};

/** Label, control and message with the ids and aria attributes wired together. */
export function FormField({ label, error, hint, children, className, ...props }: FormFieldProps) {
  const id = useId();
  const messageId = `${id}-message`;
  const message = error ?? hint;

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)} {...props}>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": message ? messageId : undefined,
      })}
      {message ? (
        <p
          id={messageId}
          className={cn("text-[13px]", error ? "text-destructive" : "text-muted-foreground")}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
