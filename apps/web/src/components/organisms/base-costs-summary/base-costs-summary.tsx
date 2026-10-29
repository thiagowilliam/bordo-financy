import type { ReactNode } from "react";

import { Money } from "@/components/atoms/money";
import type { CurrencyCode } from "@/lib/money";
import { formatMoney } from "@/lib/money";
import { cn } from "@/lib/utils";

export type BaseCostsSummaryProps = Omit<React.ComponentProps<"section">, "children"> & {
  totalInCents: number;
  budgetInCents: number;
  currency: CurrencyCode;
  itemCount: number;
  typeCount: number;
  /** Mobile-only slot rendered below the metrics (e.g. the "Adicionar custo" button). */
  action?: ReactNode;
};

function Divider({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("h-[60px] w-px shrink-0 bg-border md:h-[76px]", className)} />
  );
}

/** Summary card for the "Custos de base" screen: total, budget share and item count. */
export function BaseCostsSummary({
  totalInCents,
  budgetInCents,
  currency,
  itemCount,
  typeCount,
  action,
  className,
  ...props
}: BaseCostsSummaryProps) {
  const percent = budgetInCents > 0 ? Math.round((totalInCents / budgetInCents) * 100) : null;
  const typeLabel = typeCount === 1 ? "tipo" : "tipos";
  return (
    <section
      aria-label="Resumo dos custos de base"
      className={cn(
        "flex flex-col gap-[18px] rounded-2xl border border-border bg-card p-5 md:px-0 md:py-[26px]",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-3.5 md:flex-row md:items-stretch md:gap-0">
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-[3px] md:gap-1 md:px-8 md:pr-3">
          <span className="text-xs font-semibold text-muted-foreground md:text-sm">
            <span className="md:hidden">Total</span>
            <span className="hidden md:inline">Total em custos de base</span>
          </span>
          <Money
            amount={totalInCents}
            currency={currency}
            tone="primary"
            className="text-[28px] font-bold tracking-[-0.5px] md:text-[44px] md:tracking-[-1px]"
          />
          <span className="text-[11px] text-muted-foreground md:text-[13px]">Tudo pago</span>
        </div>
        <div aria-hidden className="h-px w-full shrink-0 bg-border md:hidden" />
        <Divider className="hidden md:block" />
        <div className="flex items-stretch md:contents">
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-[3px] pr-3 md:w-[260px] md:flex-none md:gap-1 md:px-8">
            <span className="text-xs font-semibold text-muted-foreground md:text-sm">
              Do orçamento
            </span>
            <span className="text-[22px] font-bold tracking-[-0.5px] text-foreground financial-value md:text-[28px] md:tracking-[-1px]">
              {percent === null ? "-" : `${percent}%`}
            </span>
            <span className="text-[11px] text-muted-foreground md:text-[13px]">
              <span className="md:hidden">
                de {formatMoney(budgetInCents, currency, { trimZeroCents: true })}
              </span>
              <span className="hidden md:inline">de {formatMoney(budgetInCents, currency)}</span>
            </span>
          </div>
          <Divider />
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-[3px] pl-3.5 md:w-[260px] md:flex-none md:gap-1 md:px-8">
            <span className="text-xs font-semibold text-muted-foreground md:text-sm">Itens</span>
            <span className="text-[22px] font-bold tracking-[-0.5px] text-foreground financial-value md:text-[28px] md:tracking-[-1px]">
              {itemCount}
            </span>
            <span className="text-[11px] text-muted-foreground md:text-[13px]">
              em {typeCount} {typeLabel}
            </span>
          </div>
        </div>
      </div>
      {action ? <div className="md:hidden [&>*]:w-full">{action}</div> : null}
    </section>
  );
}
