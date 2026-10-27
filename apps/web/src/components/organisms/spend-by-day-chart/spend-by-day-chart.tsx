"use client";

import { Bar, BarChart, Cell, XAxis } from "recharts";

import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Money } from "@/components/atoms/money";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type SpendByDayState = "past" | "today" | "future";

export type SpendByDayItem = {
  day: number;
  amountInCents: number;
  state: SpendByDayState;
};

export type SpendByDayChartProps = Omit<React.ComponentProps<"section">, "children"> & {
  days: SpendByDayItem[];
  currency: CurrencyCode;
  averageInCents: number;
  /** Already formatted subtitle, e.g. "Dia a dia, de 12 a 26 out". */
  subtitle: string;
};

const chartConfig = {
  amountInCents: { label: "Gasto", color: "var(--chart-8)" },
} satisfies ChartConfig;

const barFill: Record<SpendByDayState, string> = {
  past: "var(--chart-8)",
  today: "var(--primary)",
  future: "var(--background)",
};

type DayTickProps = {
  x?: number | string;
  y?: number | string;
  payload?: { value: number };
  todayDay?: number;
};

function DayTick({ x = 0, y = 0, payload, todayDay }: DayTickProps) {
  const isToday = payload?.value === todayDay;
  return (
    <text
      x={Number(x)}
      y={Number(y) + 12}
      textAnchor="middle"
      fontSize={10}
      className={isToday ? "fill-primary font-bold" : "fill-muted-foreground font-medium"}
    >
      {payload?.value}
    </text>
  );
}

type DayTooltipProps = {
  active?: boolean;
  payload?: ReadonlyArray<{ payload?: SpendByDayItem }>;
  currency: CurrencyCode;
};

function DayTooltip({ active, payload, currency }: DayTooltipProps) {
  const item = payload?.[0]?.payload;
  if (!active || !item || item.state === "future") return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-2.5 py-1.5 text-xs shadow-md">
      <div className="text-muted-foreground">Dia {item.day}</div>
      <div className="font-semibold text-foreground financial-value">
        {formatMoney(item.amountInCents, currency)}
      </div>
    </div>
  );
}

/** Daily spending bars across the trip, with today highlighted and future days as stubs. */
export function SpendByDayChart({
  days,
  currency,
  averageInCents,
  subtitle,
  className,
  ...props
}: SpendByDayChartProps) {
  const todayDay = days.find((item) => item.state === "today")?.day;

  return (
    <section
      aria-labelledby="spend-by-day-title"
      className={cn(
        "flex flex-col gap-4 rounded-xl border border-border bg-card p-5 md:gap-5 md:rounded-2xl md:p-7",
        className,
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5 md:gap-[3px]">
          <h2 id="spend-by-day-title" className="text-[17px] font-bold text-foreground md:text-lg">
            Gasto por dia
          </h2>
          <p className="hidden text-[13px] text-muted-foreground md:block">{subtitle}</p>
          <p aria-hidden="true" className="text-[13px] text-muted-foreground md:hidden">
            Média diária
          </p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="hidden text-[13px] font-semibold text-muted-foreground md:block">
            Média diária
          </span>
          <Money
            amount={averageInCents}
            currency={currency}
            className="text-[22px] font-bold tracking-[-0.4px] text-primary-strong md:text-[28px] md:tracking-[-0.6px]"
          />
        </div>
      </div>
      <div aria-hidden="true">
        <ChartContainer config={chartConfig} className="aspect-auto h-33.5 w-full md:h-48.5">
          <BarChart
            data={days}
            barCategoryGap="22%"
            margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          >
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              interval={0}
              tick={<DayTick todayDay={todayDay} />}
            />
            <ChartTooltip cursor={false} content={<DayTooltip currency={currency} />} />
            <Bar
              dataKey="amountInCents"
              radius={[4, 4, 0, 0]}
              minPointSize={4}
              isAnimationActive={false}
            >
              {days.map((item) => (
                <Cell key={item.day} fill={barFill[item.state]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
      <table className="sr-only">
        <caption>Gasto por dia da viagem</caption>
        <thead>
          <tr>
            <th scope="col">Dia</th>
            <th scope="col">Gasto</th>
          </tr>
        </thead>
        <tbody>
          {days
            .filter((item) => item.state !== "future")
            .map((item) => (
              <tr key={item.day}>
                <th scope="row">Dia {item.day}</th>
                <td>{formatMoney(item.amountInCents, currency)}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </section>
  );
}
