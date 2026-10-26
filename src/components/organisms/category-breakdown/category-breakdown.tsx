"use client";

import { Cell, Pie, PieChart } from "recharts";

import { Money } from "@/components/atoms/money";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CategoryBreakdownItem = {
  id: string;
  name: string;
  /** Category color token index (chart-1..8). */
  color: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  amountInCents: number;
};

export type CategoryBreakdownProps = Omit<React.ComponentProps<"section">, "children"> & {
  /** Already sorted by amount, descending. */
  items: CategoryBreakdownItem[];
  currency: CurrencyCode;
};

const dotClass: Record<CategoryBreakdownItem["color"], string> = {
  1: "bg-chart-1",
  2: "bg-chart-2",
  3: "bg-chart-3",
  4: "bg-chart-4",
  5: "bg-chart-5",
  6: "bg-chart-6",
  7: "bg-chart-7",
  8: "bg-chart-8",
};

/** Donut plus legend of spending per category. */
export function CategoryBreakdown({
  items,
  currency,
  className,
  ...props
}: CategoryBreakdownProps) {
  const total = items.reduce((sum, item) => sum + item.amountInCents, 0);
  const config: ChartConfig = Object.fromEntries(
    items.map((item) => [item.id, { label: item.name, color: `var(--chart-${item.color})` }]),
  );

  return (
    <section
      aria-labelledby="category-breakdown-title"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 md:gap-5 md:rounded-2xl md:p-7",
        className,
      )}
      {...props}
    >
      <h2
        id="category-breakdown-title"
        className="text-[17px] font-bold text-foreground md:text-lg"
      >
        Gastos por categoria
      </h2>
      {items.length === 0 || total === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum gasto por categoria ainda</p>
      ) : (
        <div className="flex items-center gap-[18px] md:gap-5">
          <div className="relative size-32 shrink-0 md:size-37.5">
            <div aria-hidden="true" className="size-full">
              <ChartContainer config={config} className="aspect-auto size-full">
                <PieChart>
                  <Pie
                    data={items}
                    dataKey="amountInCents"
                    nameKey="name"
                    innerRadius="68%"
                    outerRadius="100%"
                    stroke="none"
                    isAnimationActive={false}
                  >
                    {items.map((item) => (
                      <Cell key={item.id} fill={`var(--chart-${item.color})`} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs font-medium text-muted-foreground">Dia a dia</span>
              <Money
                amount={total}
                currency={currency}
                hideCents
                className="text-[19px] font-bold tracking-[-0.4px] text-foreground"
              />
            </div>
          </div>
          <ul className="flex min-w-0 flex-1 flex-col gap-[9px] md:gap-2.5">
            {items.map((item) => (
              <li key={item.id} className="flex items-center gap-2 text-[13px]">
                <span
                  aria-hidden="true"
                  className={cn("size-[9px] shrink-0 rounded-full", dotClass[item.color])}
                />
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {item.name}
                  <span className="sr-only">
                    , {formatMoney(item.amountInCents, currency, { hideCents: true })}
                  </span>
                </span>
                <span className="shrink-0 text-right font-semibold text-muted-foreground financial-value">
                  {Math.round((item.amountInCents / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
