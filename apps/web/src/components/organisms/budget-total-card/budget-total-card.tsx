import type { ReactNode } from "react";

import { Money } from "@/components/atoms/money";
import { ProgressBar } from "@/components/atoms/progress-bar";
import { StatusBadge } from "@/components/atoms/status-badge";
import { getBudgetSummary, type BudgetStatus } from "@/lib/budget";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

const percentToneClass: Record<BudgetStatus, string> = {
  ok: "text-success-ink",
  warning: "text-warning-ink",
  over: "text-destructive-ink",
};

export type BudgetTotalCardProps = Omit<React.ComponentProps<"section">, "children"> & {
  spentInCents: number;
  budgetInCents: number;
  currency: CurrencyCode;
  /** Trip length in days; shown beside the remaining amount on desktop. */
  tripDays?: number;
  /** Control right after the budget text, e.g. a `BudgetAdjustPopover`. */
  budgetAction?: ReactNode;
  /** Discreet note below the progress bar, e.g. the last budget adjustment. */
  budgetNote?: string;
};

/** Headline card of the overview: total spent against the budget. */
export function BudgetTotalCard({
  spentInCents,
  budgetInCents,
  currency,
  tripDays,
  budgetAction,
  budgetNote,
  className,
  ...props
}: BudgetTotalCardProps) {
  const { status, percentUsed, progress, remainingInCents } = getBudgetSummary(
    spentInCents,
    budgetInCents,
  );
  const isOver = status === "over";

  return (
    <section
      aria-label="Total gasto"
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-5 md:rounded-2xl md:p-7",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold text-muted-foreground md:text-[15px]">
          Total gasto
        </span>
        <StatusBadge status={status} />
      </div>
      <Money
        amount={spentInCents}
        currency={currency}
        className="text-[46px] leading-[1.2] font-bold tracking-[-1.2px] md:text-[60px] md:tracking-[-1.8px]"
      />
      <div className="flex items-center gap-1.5">
        <p className="text-sm text-muted-foreground md:text-[15px]">
          de <Money amount={budgetInCents} currency={currency} trimZeroCents tone="muted" /> de
          orçamento
        </p>
        {budgetAction}
      </div>
      <ProgressBar progress={progress} status={status} aria-label="Orçamento usado" />
      <div className="flex items-center justify-between gap-3 text-[13px] md:text-sm">
        <span className={cn("font-semibold", percentToneClass[status])}>{percentUsed}% usado</span>
        {isOver ? (
          <span className="font-semibold text-destructive-ink">
            <Money
              amount={Math.abs(remainingInCents)}
              currency={currency}
              tone="destructive"
              className="font-semibold"
            />{" "}
            acima do orçamento
          </span>
        ) : (
          <span className="text-muted-foreground">
            <Money amount={remainingInCents} currency={currency} tone="muted" /> restantes
            {tripDays ? (
              <span className="hidden md:inline"> · {tripDays} dias de viagem</span>
            ) : null}
          </span>
        )}
      </div>
      {budgetNote ? <p className="text-[13px] text-subtle-foreground">{budgetNote}</p> : null}
    </section>
  );
}
