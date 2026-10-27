import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const rowActionButtonVariants = cva(
  "flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-card outline-none hover:bg-background focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4",
  {
    variants: {
      tone: {
        default: "text-muted-foreground",
        destructive: "text-destructive",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export type RowActionButtonProps = Omit<React.ComponentProps<"button">, "children" | "aria-label"> &
  VariantProps<typeof rowActionButtonVariants> & {
    /** Rendered icon element, e.g. `<Pencil />`. */
    icon: React.ReactNode;
    /** Accessible name (required, the button has no visible text). */
    label: string;
  };

/** 34px square icon button for row actions such as edit and delete. */
export function RowActionButton({
  icon,
  label,
  tone,
  type = "button",
  className,
  ...props
}: RowActionButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(rowActionButtonVariants({ tone }), className)}
      {...props}
    >
      <span aria-hidden className="flex">
        {icon}
      </span>
    </button>
  );
}
