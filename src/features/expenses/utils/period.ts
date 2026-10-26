import { addDays, format, parseISO } from "date-fns";

export type ExpensePeriodPreset = "today" | "yesterday" | "last3" | "all" | "custom";

/** Dates are ISO (yyyy-MM-dd). `from`/`to` are only used by the `custom` preset. */
export type ExpensePeriod = { preset: ExpensePeriodPreset; from?: string; to?: string };

type ResolvePeriodContext = {
  /** ISO date of the current day. */
  today: string;
  trip: { startDate: string; endDate: string };
};

const iso = (date: Date) => format(date, "yyyy-MM-dd");

/** Turns a period filter into the `from`/`to` range sent to the API. */
export function resolvePeriod(
  period: ExpensePeriod | null,
  { today, trip }: ResolvePeriodContext,
): { from?: string; to?: string } {
  if (!period) return {};
  switch (period.preset) {
    case "today":
      return { from: today, to: today };
    case "yesterday": {
      const yesterday = iso(addDays(parseISO(today), -1));
      return { from: yesterday, to: yesterday };
    }
    case "last3":
      return { from: iso(addDays(parseISO(today), -2)), to: today };
    case "all":
      return { from: trip.startDate, to: trip.endDate };
    case "custom": {
      if (!period.from || !period.to) return {};
      return period.from <= period.to
        ? { from: period.from, to: period.to }
        : { from: period.to, to: period.from };
    }
  }
}
