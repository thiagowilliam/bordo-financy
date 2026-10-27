import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Trip } from "../types";

type FormatTripPeriodOptions = {
  /** Years are omitted for trips that are happening now, like the design. */
  showYear?: boolean;
};

const clean = (value: string) => value.replace(".", "");

/** "12 – 26 out", "04 – 18 mar 2027", "28 out – 03 nov", "28 dez 2026 – 03 jan 2027". */
export function formatTripPeriod(
  { startDate, endDate }: Pick<Trip, "startDate" | "endDate">,
  { showYear = true }: FormatTripPeriodOptions = {},
): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);
  const month = (date: Date) => clean(format(date, "MMM", { locale: ptBR }));
  const sameYear = start.getFullYear() === end.getFullYear();
  const sameMonth = sameYear && start.getMonth() === end.getMonth();
  const year = showYear ? ` ${end.getFullYear()}` : "";

  if (!sameYear) {
    return `${format(start, "dd")} ${month(start)} ${start.getFullYear()} – ${format(end, "dd")} ${month(end)} ${end.getFullYear()}`;
  }
  if (sameMonth) return `${format(start, "dd")} – ${format(end, "dd")} ${month(end)}${year}`;
  return `${format(start, "dd")} ${month(start)} – ${format(end, "dd")} ${month(end)}${year}`;
}
