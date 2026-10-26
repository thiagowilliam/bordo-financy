import { Money } from "@/components/atoms/money";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CostItemRowProps = Omit<React.ComponentProps<"div">, "children"> & {
  description: string;
  /** Preformatted, e.g. "Pago em 14 jul". */
  paidOnLabel: string;
  amountInCents: number;
  currency: CurrencyCode;
};

/** Ledger row for a single base cost. */
export function CostItemRow({
  description,
  paidOnLabel,
  amountInCents,
  currency,
  className,
  ...props
}: CostItemRowProps) {
  return (
    <div className={cn("flex items-center gap-3.5 py-3", className)} {...props}>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-base font-semibold text-foreground">{description}</span>
        <span className="text-[13px] text-muted-foreground">{paidOnLabel}</span>
      </div>
      <Money
        amount={amountInCents}
        currency={currency}
        className="w-[92px] shrink-0 text-right text-base font-semibold md:w-[110px]"
      />
    </div>
  );
}
