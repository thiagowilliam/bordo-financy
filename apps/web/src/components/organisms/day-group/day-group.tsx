import { useId } from "react";

import { DayHeader, type DayHeaderProps } from "@/components/molecules/day-header";
import { EntryRow, type EntryRowProps } from "@/components/molecules/entry-row";
import { cn } from "@/lib/utils";

export type DayGroupEntry = EntryRowProps & { id: string };

export type DayGroupProps = Omit<DayHeaderProps, "labelId"> & {
  entries: DayGroupEntry[];
  /** Builds the desktop action buttons for an entry. Rendered by the caller. */
  renderActions?: (id: string) => React.ReactNode;
};

/** One day of the Dia a dia list: the day header and a card with its entries. */
export function DayGroup({
  entries,
  renderActions,
  className,
  label,
  isToday,
  trend,
  totalInCents,
  currency,
  ...props
}: DayGroupProps) {
  const labelId = useId();
  return (
    <section
      aria-labelledby={labelId}
      className={cn("flex flex-col gap-2.5", className)}
      {...props}
    >
      <DayHeader
        label={label}
        isToday={isToday}
        trend={trend}
        totalInCents={totalInCents}
        currency={currency}
        labelId={labelId}
      />
      <ul className="overflow-clip rounded-2xl border border-border bg-card py-0.5 md:py-1">
        {entries.map(({ id, ...entry }) => (
          <li key={id} className="px-3.5 not-first:*:border-t not-first:*:border-border md:px-4.5">
            <EntryRow {...entry} actions={entry.actions ?? renderActions?.(id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}
