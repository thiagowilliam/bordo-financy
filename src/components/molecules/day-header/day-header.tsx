import { ArrowDown, ArrowUp } from "lucide-react";

import { Money } from "@/components/atoms/money";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type DayHeaderTrend = {
  direction: "up" | "down";
  /** Whole percent compared with the trip daily average. */
  percent: number;
};

export type DayHeaderProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Already formatted, e.g. "Dia 11 · 22 out". */
  label: string;
  isToday?: boolean;
  trend?: DayHeaderTrend;
  totalInCents: number;
  currency: CurrencyCode;
  /** Id applied to the label so a parent section can reference it. */
  labelId?: string;
};

/** Bar that opens a day group: label, optional today pill, trend and day total. */
export function DayHeader({
  label,
  isToday,
  trend,
  totalInCents,
  currency,
  labelId,
  className,
  ...props
}: DayHeaderProps) {
  const isDown = trend?.direction === "down";
  const TrendIcon = isDown ? ArrowDown : ArrowUp;
  return (
    <div
      className={cn(
        "flex items-center gap-2.5 rounded-lg bg-secondary px-3.5 py-[11px] md:px-4",
        className,
      )}
      {...props}
    >
      <span id={labelId} className="text-[15px] font-bold text-foreground">
        {label}
      </span>
      {isToday ? (
        <span className="rounded-full bg-primary-soft px-2.5 py-[3px] text-xs font-bold text-primary-strong">
          Hoje
        </span>
      ) : null}
      <span className="flex-1" />
      {trend ? (
        <span
          className={cn(
            "flex items-center gap-1 text-xs font-semibold",
            isDown ? "text-success-ink" : "text-warning-ink",
          )}
        >
          <TrendIcon
            aria-hidden
            data-testid="trend-icon"
            className={cn("size-3.5", isDown ? "text-success" : "text-warning")}
          />
          <span aria-hidden className="md:hidden">
            {trend.percent}%
          </span>
          <span className="max-md:sr-only">
            {trend.percent}% {isDown ? "abaixo" : "acima"} da média
          </span>
        </span>
      ) : null}
      <Money
        amount={totalInCents}
        currency={currency}
        tone="primary"
        className="text-[17px] font-bold"
      />
    </div>
  );
}
