import { cva } from "class-variance-authority";

import type { BudgetStatus } from "@/lib/budget";
import { cn } from "@/lib/utils";

const statusBadgeVariants = cva(
  "inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-[5px] text-xs font-semibold",
  {
    variants: {
      status: {
        ok: "bg-success-soft text-success-ink",
        warning: "bg-warning-soft text-warning-ink",
        over: "bg-destructive-soft text-destructive-ink",
      },
    },
    defaultVariants: { status: "ok" },
  },
);

const dotVariants = cva("size-[7px] rounded-full", {
  variants: {
    status: { ok: "bg-success", warning: "bg-warning", over: "bg-destructive" },
  },
});

export const statusLabels: Record<BudgetStatus, string> = {
  ok: "Dentro do orçamento",
  warning: "Perto do limite",
  over: "Acima do orçamento",
};

export type StatusBadgeProps = Omit<React.ComponentProps<"span">, "children"> & {
  status: BudgetStatus;
  /** Overrides the default label. */
  label?: string;
};

export function StatusBadge({ status, label, className, ...props }: StatusBadgeProps) {
  return (
    <span className={cn(statusBadgeVariants({ status }), className)} {...props}>
      <span className={dotVariants({ status })} aria-hidden="true" />
      {label ?? statusLabels[status]}
    </span>
  );
}
