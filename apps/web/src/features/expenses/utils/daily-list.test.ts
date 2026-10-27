import { describe, expect, it } from "vitest";

import { categoriesFixture } from "@/mocks/fixtures/categories";
import { dailyExpensesFixture, LISBON_DAILY_TOTAL_IN_CENTS } from "@/mocks/fixtures/expenses";

import {
  formatDayLabel,
  getAverageDailyInCents,
  groupExpensesByDay,
  summarizePeriod,
} from "./daily-list";

const trip = { startDate: "2026-10-12", endDate: "2026-10-26" };
const today = "2026-10-22";

describe("formatDayLabel", () => {
  it("numbers the day of the trip", () => {
    expect(formatDayLabel("2026-10-22", trip.startDate)).toBe("Dia 11 · 22 out");
    expect(formatDayLabel("2026-10-12", trip.startDate)).toBe("Dia 1 · 12 out");
  });
});

describe("getAverageDailyInCents", () => {
  it("divides by the elapsed days and caps at the trip end", () => {
    expect(getAverageDailyInCents(dailyExpensesFixture, trip, today)).toBe(
      Math.round(LISBON_DAILY_TOTAL_IN_CENTS / 11),
    );
    expect(getAverageDailyInCents(dailyExpensesFixture, trip, "2026-12-01")).toBe(
      Math.round(LISBON_DAILY_TOTAL_IN_CENTS / 15),
    );
    expect(getAverageDailyInCents(dailyExpensesFixture, trip, "2026-10-01")).toBe(0);
  });
});

describe("groupExpensesByDay", () => {
  const averageDailyInCents = getAverageDailyInCents(dailyExpensesFixture, trip, today);
  const groups = groupExpensesByDay({
    expenses: dailyExpensesFixture,
    tripStartDate: trip.startDate,
    today,
    averageDailyInCents,
  });

  it("orders days newest first and flags today", () => {
    expect(groups[0]).toMatchObject({
      date: "2026-10-22",
      isToday: true,
      label: "Dia 11 · 22 out",
    });
    const dates = groups.map((group) => group.date);
    expect(dates).toEqual(dates.toSorted().toReversed());
  });

  it("totals each day and keeps every expense", () => {
    expect(groups.reduce((sum, group) => sum + group.totalInCents, 0)).toBe(
      LISBON_DAILY_TOTAL_IN_CENTS,
    );
    expect(groups.flatMap((group) => group.expenses)).toHaveLength(dailyExpensesFixture.length);
  });

  it("compares each day with the average", () => {
    for (const group of groups) {
      if (!group.trend) continue;
      expect(group.trend.direction).toBe(group.totalInCents > averageDailyInCents ? "up" : "down");
    }
  });

  it("omits the trend when there is no average", () => {
    const [group] = groupExpensesByDay({
      expenses: dailyExpensesFixture,
      tripStartDate: trip.startDate,
      today,
      averageDailyInCents: 0,
    });
    expect(group.trend).toBeUndefined();
  });
});

describe("summarizePeriod", () => {
  it("summarizes totals, days and categories", () => {
    const summary = summarizePeriod(dailyExpensesFixture, categoriesFixture);
    expect(summary.totalInCents).toBe(LISBON_DAILY_TOTAL_IN_CENTS);
    expect(summary.entryCount).toBe(dailyExpensesFixture.length);
    expect(summary.dayCount).toBe(11);
    expect(summary.averageInCents).toBe(Math.round(LISBON_DAILY_TOTAL_IN_CENTS / 11));
    const amounts = summary.categories.map((category) => category.amountInCents);
    expect(amounts).toEqual(amounts.toSorted((a, b) => b - a));
  });

  it("handles an empty list", () => {
    expect(summarizePeriod([], categoriesFixture)).toMatchObject({
      totalInCents: 0,
      dayCount: 0,
      averageInCents: 0,
      categories: [],
    });
  });
});
