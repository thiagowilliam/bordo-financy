import { differenceInCalendarDays, format, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const toDate = (iso: string | undefined) => {
  if (!iso) return undefined;
  const date = parseISO(iso);
  return isValid(date) ? date : undefined;
};

export const toIso = (date: Date) => format(date, "yyyy-MM-dd");

/** "Hoje, 22 out · Dia 11", or "21 out · Dia 10". The trip day is omitted before the trip starts. */
export function formatExpenseDate(value: string, today: string, tripStartDate: string) {
  const date = toDate(value);
  if (!date) return undefined;
  const short = format(date, "d MMM", { locale: ptBR }).replace(".", "");
  const prefix = value === today ? "Hoje, " : "";
  const start = toDate(tripStartDate);
  const day = start ? differenceInCalendarDays(date, start) + 1 : 0;
  return `${prefix}${short}${day >= 1 ? ` · Dia ${day}` : ""}`;
}
