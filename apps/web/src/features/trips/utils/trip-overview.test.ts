import { describe, expect, it } from "vitest";

import type { BaseCost } from "@/features/base-costs";
import { categoriesFixture } from "@/mocks/fixtures/categories";
import {
  baseCostsFixture,
  dailyExpensesFixture,
  LISBON_BASE_TOTAL_IN_CENTS,
  LISBON_DAILY_TOTAL_IN_CENTS,
} from "@/mocks/fixtures/expenses";

import { buildTripOverview, formatExpenseDay } from "./trip-overview";

const trip = { startDate: "2026-10-12", endDate: "2026-10-26" };

const build = (today: string) =>
  buildTripOverview({
    trip,
    baseCosts: baseCostsFixture as BaseCost[],
    dailyExpenses: dailyExpensesFixture,
    categories: categoriesFixture,
    today,
  });

describe("buildTripOverview", () => {
  const overview = build("2026-10-22");

  it("totals base costs and daily expenses", () => {
    expect(overview.base.totalInCents).toBe(LISBON_BASE_TOTAL_IN_CENTS);
    expect(overview.base.count).toBe(baseCostsFixture.length);
    expect(overview.daily.totalInCents).toBe(LISBON_DAILY_TOTAL_IN_CENTS);
    expect(overview.spentInCents).toBe(LISBON_BASE_TOTAL_IN_CENTS + LISBON_DAILY_TOTAL_IN_CENTS);
  });

  it("builds one entry per trip day with past, today and future states", () => {
    expect(overview.tripDays).toBe(15);
    expect(overview.days[0]).toMatchObject({ day: 1, date: "2026-10-12", state: "past" });
    expect(overview.days[10]).toMatchObject({ day: 11, date: "2026-10-22", state: "today" });
    expect(overview.days[11]).toMatchObject({ day: 12, state: "future", amountInCents: 0 });
  });

  it("averages daily spending over the days that already happened", () => {
    expect(overview.averageDailyInCents).toBe(Math.round(LISBON_DAILY_TOTAL_IN_CENTS / 11));
    expect(build("2026-10-01").averageDailyInCents).toBe(0);
  });

  it("sorts categories by amount and sums their amounts to the daily total", () => {
    const amounts = overview.categories.map((category) => category.amountInCents);
    expect(amounts).toEqual(amounts.toSorted((a, b) => b - a));
    expect(amounts.reduce((total, amount) => total + amount, 0)).toBe(LISBON_DAILY_TOTAL_IN_CENTS);
  });

  it("returns the newest daily expenses first", () => {
    expect(overview.latest).toHaveLength(5);
    const dates = overview.latest.map((expense) => expense.date);
    expect(dates).toEqual(dates.toSorted().toReversed());
  });

  it("handles a trip without expenses", () => {
    const empty = buildTripOverview({
      trip,
      baseCosts: [],
      dailyExpenses: [],
      categories: categoriesFixture,
      today: "2026-10-22",
    });
    expect(empty.spentInCents).toBe(0);
    expect(empty.averageDailyInCents).toBe(0);
    expect(empty.categories).toEqual([]);
    expect(empty.latest).toEqual([]);
  });
});

describe("formatExpenseDay", () => {
  it("labels today, yesterday and older dates", () => {
    expect(formatExpenseDay("2026-10-22", "2026-10-22")).toBe("Hoje");
    expect(formatExpenseDay("2026-10-21", "2026-10-22")).toBe("Ontem");
    expect(formatExpenseDay("2026-10-18", "2026-10-22")).toBe("18 out");
  });
});
