import { Money } from "@/components/atoms/money";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type ListSummaryProps = Omit<React.ComponentProps<"div">, "children"> & {
  count: number;
  dayCount?: number;
  totalInCents: number;
  currency: CurrencyCode;
};

function pluralize(n: number, singular: string, plural: string) {
  return `${n} ${n === 1 ? singular : plural}`;
}

/** Mobile summary row under the filters: entry count and period total. */
export function ListSummary({
  count,
  dayCount,
  totalInCents,
  currency,
  className,
  ...props
}: ListSummaryProps) {
  const text =
    dayCount === undefined
      ? pluralize(count, "lançamento", "lançamentos")
      : `${pluralize(count, "lançamento", "lançamentos")} em ${pluralize(dayCount, "dia", "dias")}`;
  return (
    <div className={cn("flex items-end justify-between gap-3", className)} {...props}>
      <span className="text-[13px] font-normal text-muted-foreground">{text}</span>
      <Money
        amount={totalInCents}
        currency={currency}
        tone="primary"
        className="text-xl font-bold tracking-[-0.3px] text-primary"
      />
    </div>
  );
}
