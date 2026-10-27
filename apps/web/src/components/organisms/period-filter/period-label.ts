import { format, isSameMonth, isSameYear, isValid, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export type PeriodPreset = "today" | "yesterday" | "last3" | "all" | "custom";

/** `null` means no period filter. The parent resolves presets to dates. */
export type PeriodFilterValue = {
  preset: PeriodPreset;
  /** ISO date (yyyy-MM-dd). */
  from?: string;
  /** ISO date (yyyy-MM-dd). */
  to?: string;
} | null;

export const periodPresetLabels: Record<PeriodPreset, string> = {
  today: "Hoje",
  yesterday: "Ontem",
  last3: "Últimos 3 dias",
  all: "Toda a viagem",
  custom: "Personalizado",
};

export const periodPresets = Object.keys(periodPresetLabels) as PeriodPreset[];

const parse = (iso: string | undefined) => {
  if (!iso) return undefined;
  const date = parseISO(iso);
  return isValid(date) ? date : undefined;
};

/** "20 out 2026" */
export function formatPeriodDate(iso: string | undefined): string {
  const date = parse(iso);
  return date ? format(date, "dd MMM yyyy", { locale: ptBR }) : "";
}

/** Short form for chips: "20 a 22 out", "28 set a 2 out" or the preset name. */
export function formatPeriodSummary(value: NonNullable<PeriodFilterValue>): string {
  if (value.preset !== "custom") return periodPresetLabels[value.preset];
  const from = parse(value.from);
  const to = parse(value.to) ?? from;
  if (!from || !to) return periodPresetLabels.custom;
  const day = (date: Date) => format(date, "d", { locale: ptBR });
  const dayMonth = (date: Date) => format(date, "d MMM", { locale: ptBR });
  const withYear = isSameYear(from, to) ? "" : ` ${format(to, "yyyy")}`;
  if (from.getTime() === to.getTime()) return `${dayMonth(from)}${withYear}`;
  if (isSameMonth(from, to)) return `${day(from)} a ${dayMonth(to)}${withYear}`;
  return `${dayMonth(from)} a ${dayMonth(to)}${withYear}`;
}
