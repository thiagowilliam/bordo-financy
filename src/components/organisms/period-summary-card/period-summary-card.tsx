import { Money } from "@/components/atoms/money";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

type CategoryColor = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export type PeriodSummaryCategory = {
  id: string;
  name: string;
  color: CategoryColor;
  amountInCents: number;
};

export type PeriodSummaryCardProps = Omit<React.ComponentProps<"aside">, "children"> & {
  totalInCents: number;
  entryCount: number;
  averageInCents: number;
  dayCount: number;
  currency: CurrencyCode;
  /** Sorted by amount, descending. */
  categories: PeriodSummaryCategory[];
  /** Shows the "Filtrado" pill next to the title when the summary reflects active filters. */
  filtered?: boolean;
};

const swatch: Record<CategoryColor, string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
  6: "bg-chart-6",
  7: "bg-chart-7",
  8: "bg-chart-8",
};

/** Desktop side card with totals, daily average and spend per category for the period. */
export function PeriodSummaryCard({
  totalInCents,
  entryCount,
  averageInCents,
  dayCount,
  currency,
  categories,
  filtered = false,
  className,
  ...props
}: PeriodSummaryCardProps) {
  const largest = Math.max(...categories.map((c) => c.amountInCents), 0);
  return (
    <aside
      aria-labelledby="period-summary-title"
      className={cn(
        "flex flex-col gap-[18px] rounded-2xl border border-border bg-card p-6",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2.5">
        <h2 id="period-summary-title" className="text-lg font-bold text-foreground">
          Resumo do período
        </h2>
        {filtered ? (
          <span className="rounded-full bg-primary-soft px-2.5 py-[3px] text-xs font-bold text-primary-strong">
            Filtrado
          </span>
        ) : null}
      </div>
      <hr className="border-border" />
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold text-muted-foreground">Total no dia a dia</span>
        <Money
          amount={totalInCents}
          currency={currency}
          tone="primary"
          className="text-[34px] font-bold tracking-[-0.8px]"
        />
        <span className="text-[13px] text-muted-foreground">
          {entryCount} {entryCount === 1 ? "lançamento" : "lançamentos"}
        </span>
      </div>
      <div className="flex flex-col gap-0.5">
        <span className="text-[13px] font-semibold text-muted-foreground">Média por dia</span>
        <Money
          amount={averageInCents}
          currency={currency}
          className="text-2xl font-bold tracking-[-0.5px]"
        />
        <span className="text-[13px] text-muted-foreground">
          em {dayCount} {dayCount === 1 ? "dia" : "dias"} de viagem
        </span>
      </div>
      <hr className="border-border" />
      <h3 className="text-[13px] font-semibold text-muted-foreground">Por categoria</h3>
      <hr className="border-border" />
      {categories.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Sem lançamentos no período</p>
      ) : (
        <ul className="flex flex-col gap-3.5">
          {categories.map((category) => (
            <li key={category.id} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={cn("size-[9px] shrink-0 rounded-full", swatch[category.color])}
                />
                <span className="flex-1 truncate text-[13px] font-medium text-foreground">
                  {category.name}
                </span>
                <Money
                  amount={category.amountInCents}
                  currency={currency}
                  tone="muted"
                  className="text-[13px] font-semibold"
                />
              </div>
              <div
                role="progressbar"
                aria-label={`${category.name} no período`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={
                  largest > 0 ? Math.round((category.amountInCents / largest) * 100) : 0
                }
                className="h-2 w-full overflow-hidden rounded-full bg-secondary"
              >
                <div
                  className={cn("h-full rounded-full", swatch[category.color])}
                  style={{
                    width: `${largest > 0 ? (category.amountInCents / largest) * 100 : 0}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
