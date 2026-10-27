import { CategoryBar, categoryFill, type CategoryColor } from "@/components/atoms/category-bar";
import { Money } from "@/components/atoms/money";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CostTypeBreakdownItem = {
  id: string;
  name: string;
  color: CategoryColor;
  amountInCents: number;
};

export type CostTypeBreakdownProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** Sorted by amount, descending. */
  items: CostTypeBreakdownItem[];
  currency: CurrencyCode;
};

/** Card with the spend per cost type, bars scaled to the largest type. */
export function CostTypeBreakdown({
  items,
  currency,
  className,
  ...props
}: CostTypeBreakdownProps) {
  const largest = Math.max(...items.map((item) => item.amountInCents), 0);
  return (
    <section
      aria-labelledby="cost-type-breakdown-title"
      className={cn(
        "flex flex-col gap-[18px] rounded-2xl border border-border bg-card p-5 md:gap-5 md:p-6",
        className,
      )}
      {...props}
    >
      <h2
        id="cost-type-breakdown-title"
        className="text-[17px] font-bold text-foreground md:text-lg"
      >
        Por tipo de custo
      </h2>
      {items.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Nenhum custo de base cadastrado</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn("size-[9px] shrink-0 rounded-full", categoryFill[item.color])}
                />
                <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                  {item.name}
                </span>
                <Money
                  amount={item.amountInCents}
                  currency={currency}
                  tone="muted"
                  className="text-[13px] font-semibold"
                />
              </div>
              <CategoryBar
                aria-label={`${item.name} nos custos de base`}
                color={item.color}
                progress={largest > 0 ? item.amountInCents / largest : 0}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
