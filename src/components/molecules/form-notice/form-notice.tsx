import { cva, type VariantProps } from "class-variance-authority";
import { CircleCheck } from "lucide-react";

import { cn } from "@/lib/utils";

const formNoticeVariants = cva("flex items-start gap-3 rounded-2xl p-4 text-sm font-medium", {
  variants: { tone: { success: "bg-success-soft text-success-ink" } },
  defaultVariants: { tone: "success" },
});

export type FormNoticeProps = Omit<React.ComponentProps<"div">, "role"> &
  VariantProps<typeof formNoticeVariants>;

/** Status note shown after a form action, e.g. "Link enviado". */
export function FormNotice({ tone, className, children, ...props }: FormNoticeProps) {
  return (
    <div role="status" className={cn(formNoticeVariants({ tone }), className)} {...props}>
      <CircleCheck aria-hidden className="size-5 shrink-0" />
      <div className="min-w-0 flex-1 leading-[1.5]">{children}</div>
    </div>
  );
}
