import { cva, type VariantProps } from "class-variance-authority";
import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

const formNoticeVariants = cva("flex items-start font-medium", {
  variants: {
    tone: {
      success: "bg-success-soft text-success-ink",
      error: "bg-destructive-soft text-destructive-ink",
      warning: "bg-warning-soft text-warning-ink",
      info: "bg-primary-soft text-primary-strong",
    },
    compact: {
      false: "gap-3 rounded-2xl p-4 text-sm",
      true: "gap-2.5 rounded-xl px-3.5 py-3 text-[13.5px]",
    },
  },
  defaultVariants: { tone: "success", compact: false },
});

const icons = {
  success: CircleCheck,
  error: CircleAlert,
  warning: TriangleAlert,
  info: Info,
} as const;

export type FormNoticeProps = Omit<React.ComponentProps<"div">, "role"> &
  Omit<VariantProps<typeof formNoticeVariants>, "compact"> & { compact?: boolean };

/** Status note shown after a form action, e.g. "Link enviado" or an auth error. */
export function FormNotice({
  tone = "success",
  compact = false,
  className,
  children,
  ...props
}: FormNoticeProps) {
  const Icon = icons[tone ?? "success"];
  return (
    <div
      role={tone === "success" || tone === "info" ? "status" : "alert"}
      className={cn(formNoticeVariants({ tone, compact }), className)}
      {...props}
    >
      <Icon aria-hidden className={cn("shrink-0", compact ? "size-4.5" : "size-5")} />
      <div className={cn("min-w-0 flex-1", compact ? "leading-[1.4]" : "leading-[1.5]")}>
        {children}
      </div>
    </div>
  );
}
