import { CategoryIcon, type CategoryIconName } from "@/components/atoms/category-icon";
import { Money } from "@/components/atoms/money";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type ExpenseRowProps = Omit<React.ComponentProps<"div">, "children"> & {
  description: string;
  categoryName: string;
  categoryIcon: CategoryIconName;
  /** Category color token index (chart-1..8). */
  categoryColor: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  /** Already formatted date, e.g. "Hoje", "Ontem" or "24 out". */
  dateLabel: string;
  amountInCents: number;
  currency: CurrencyCode;
};

/** One expense line: category tile, description with category and date, and the amount. */
export function ExpenseRow({
  description,
  categoryName,
  categoryIcon,
  categoryColor,
  dateLabel,
  amountInCents,
  currency,
  className,
  ...props
}: ExpenseRowProps) {
  return (
    <div className={cn("flex items-center gap-3.5", className)} {...props}>
      <CategoryIcon icon={categoryIcon} color={categoryColor} tone="soft" />
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-base font-semibold text-foreground">{description}</span>
        <span className="truncate text-[13px] text-muted-foreground">
          {categoryName} · {dateLabel}
        </span>
      </div>
      <Money amount={amountInCents} currency={currency} className="shrink-0 font-bold" />
    </div>
  );
}
