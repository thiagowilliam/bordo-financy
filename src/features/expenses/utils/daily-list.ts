import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Category } from "@/features/categories";

import type { Expense } from "../types";

export type DayTrend = { direction: "up" | "down"; percent: number };

export type ExpenseDayGroup = {
  /** ISO date. */
  date: string;
  /** "Dia 11 · 22 out". */
  label: string;
  isToday: boolean;
  totalInCents: number;
  /** Against the average daily spending; omitted when there is no average or it is the same. */
  trend?: DayTrend;
  /** Newest first. */
  expenses: Expense[];
};

type GroupExpensesByDayInput = {
  expenses: Expense[];
  tripStartDate: string;
  today: string;
  /** Average daily spending in minor units of the whole trip (not only the filtered list). */
  averageDailyInCents: number;
};

const clean = (value: string) => value.replace(".", "");

export function formatDayLabel(date: string, tripStartDate: string): string {
  const day = differenceInCalendarDays(parseISO(date), parseISO(tripStartDate)) + 1;
  const short = clean(format(parseISO(date), "dd MMM", { locale: ptBR }));
  return day >= 1 ? `Dia ${day} · ${short}` : short;
}

/** Groups expenses by day, newest day first, with each day's total and trend against the average. */
export function groupExpensesByDay({
  expenses,
  tripStartDate,
  today,
  averageDailyInCents,
}: GroupExpensesByDayInput): ExpenseDayGroup[] {
  const byDate = Map.groupBy(expenses, (expense) => expense.date);
  return [...byDate.entries()]
    .toSorted(([a], [b]) => b.localeCompare(a))
    .map(([date, dayExpenses]) => {
      const totalInCents = dayExpenses.reduce((sum, expense) => sum + expense.amountInCents, 0);
      const percent =
        averageDailyInCents > 0
          ? Math.round((Math.abs(totalInCents - averageDailyInCents) / averageDailyInCents) * 100)
          : 0;
      return {
        date,
        label: formatDayLabel(date, tripStartDate),
        isToday: date === today,
        totalInCents,
        trend:
          percent > 0
            ? { direction: totalInCents > averageDailyInCents ? "up" : "down", percent }
            : undefined,
        expenses: dayExpenses.toSorted((a, b) => b.id.localeCompare(a.id)),
      } satisfies ExpenseDayGroup;
    });
}

export type PeriodSummary = {
  totalInCents: number;
  entryCount: number;
  dayCount: number;
  averageInCents: number;
  categories: { id: string; name: string; color: Category["color"]; amountInCents: number }[];
};

/** Totals shown in the "Resumo do período" card and the mobile summary row. */
export function summarizePeriod(expenses: Expense[], categories: Category[]): PeriodSummary {
  const totalInCents = expenses.reduce((sum, expense) => sum + expense.amountInCents, 0);
  const dayCount = new Set(expenses.map((expense) => expense.date)).size;
  const totals = Map.groupBy(expenses, (expense) => expense.categoryId);
  return {
    totalInCents,
    entryCount: expenses.length,
    dayCount,
    averageInCents: dayCount > 0 ? Math.round(totalInCents / dayCount) : 0,
    categories: categories
      .filter((category) => totals.has(category.id))
      .map((category) => ({
        id: category.id,
        name: category.name,
        color: category.color,
        amountInCents: totals.get(category.id)!.reduce((sum, e) => sum + e.amountInCents, 0),
      }))
      .toSorted((a, b) => b.amountInCents - a.amountInCents),
  };
}

/** Average spent per trip day that already happened (0 before the trip starts). */
export function getAverageDailyInCents(
  expenses: Expense[],
  trip: { startDate: string; endDate: string },
  today: string,
): number {
  const lastDay = today < trip.endDate ? today : trip.endDate;
  const elapsed = differenceInCalendarDays(parseISO(lastDay), parseISO(trip.startDate)) + 1;
  if (elapsed < 1) return 0;
  const total = expenses.reduce((sum, expense) => sum + expense.amountInCents, 0);
  return Math.round(total / elapsed);
}
