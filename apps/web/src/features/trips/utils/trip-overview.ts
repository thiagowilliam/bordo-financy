import { differenceInCalendarDays, eachDayOfInterval, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { BaseCost } from "@/features/base-costs";
import type { Category } from "@/features/categories";
import type { Expense } from "@/features/expenses";

import type { Trip } from "../types";

export type TripDayState = "past" | "today" | "future";

export type TripOverviewDay = {
  /** 1-based day of the trip. */
  day: number;
  date: string;
  amountInCents: number;
  state: TripDayState;
};

export type TripOverviewCategory = {
  id: string;
  name: string;
  icon: Category["icon"];
  color: Category["color"];
  amountInCents: number;
  /** Rounded percentage of the daily total, 0 to 100. */
  percent: number;
};

export type TripOverview = {
  spentInCents: number;
  tripDays: number;
  base: { totalInCents: number; count: number };
  daily: { totalInCents: number; count: number; daysWithExpenses: number };
  /** Daily spending divided by the days that already happened (0 before the trip starts). */
  averageDailyInCents: number;
  days: TripOverviewDay[];
  categories: TripOverviewCategory[];
  /** Newest daily expenses first. */
  latest: Expense[];
};

type BuildTripOverviewInput = {
  trip: Pick<Trip, "startDate" | "endDate">;
  baseCosts: BaseCost[];
  dailyExpenses: Expense[];
  categories: Category[];
  /** ISO date (yyyy-MM-dd). */
  today: string;
  latestCount?: number;
};

const sum = (expenses: Expense[]) => expenses.reduce((total, e) => total + e.amountInCents, 0);

function getDayState(date: string, today: string): TripDayState {
  if (date < today) return "past";
  if (date > today) return "future";
  return "today";
}

/** Aggregates what the "Visão geral" screen shows from a trip's base costs and daily expenses. */
export function buildTripOverview({
  trip,
  baseCosts,
  dailyExpenses,
  categories,
  today,
  latestCount = 5,
}: BuildTripOverviewInput): TripOverview {
  const baseTotal = sum(baseCosts);
  const dailyTotal = sum(dailyExpenses);

  const spentByDate = new Map<string, number>();
  for (const expense of dailyExpenses) {
    spentByDate.set(expense.date, (spentByDate.get(expense.date) ?? 0) + expense.amountInCents);
  }

  const dates = eachDayOfInterval({ start: parseISO(trip.startDate), end: parseISO(trip.endDate) });
  const days = dates.map((date, index): TripOverviewDay => {
    const iso = format(date, "yyyy-MM-dd");
    return {
      day: index + 1,
      date: iso,
      amountInCents: spentByDate.get(iso) ?? 0,
      state: getDayState(iso, today),
    };
  });

  const elapsedDays = days.filter((day) => day.state !== "future").length;

  const totalsByCategory = new Map<string, number>();
  for (const expense of dailyExpenses) {
    totalsByCategory.set(
      expense.categoryId,
      (totalsByCategory.get(expense.categoryId) ?? 0) + expense.amountInCents,
    );
  }
  const categoryBreakdown = categories
    .filter((category) => totalsByCategory.has(category.id))
    .map((category): TripOverviewCategory => ({
      id: category.id,
      name: category.name,
      icon: category.icon,
      color: category.color,
      amountInCents: totalsByCategory.get(category.id)!,
      percent:
        dailyTotal > 0 ? Math.round((totalsByCategory.get(category.id)! / dailyTotal) * 100) : 0,
    }))
    .toSorted((a, b) => b.amountInCents - a.amountInCents);

  return {
    spentInCents: baseTotal + dailyTotal,
    tripDays: days.length,
    base: { totalInCents: baseTotal, count: baseCosts.length },
    daily: {
      totalInCents: dailyTotal,
      count: dailyExpenses.length,
      daysWithExpenses: spentByDate.size,
    },
    averageDailyInCents: elapsedDays > 0 ? Math.round(dailyTotal / elapsedDays) : 0,
    days,
    categories: categoryBreakdown,
    latest: dailyExpenses
      .toSorted((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
      .slice(0, latestCount),
  };
}

/** "Hoje", "Ontem" or "22 out", the date label of an expense row. */
export function formatExpenseDay(date: string, today: string): string {
  const diff = differenceInCalendarDays(parseISO(today), parseISO(date));
  if (diff === 0) return "Hoje";
  if (diff === 1) return "Ontem";
  return format(parseISO(date), "dd MMM", { locale: ptBR }).replace(".", "");
}
