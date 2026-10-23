import { describe, expect, it } from "vitest";

import { categorySchema } from "@/features/categories";
import { expenseSchema } from "@/features/expenses";
import { tripSchema } from "@/features/trips";

import { categoriesFixture } from "./categories";
import {
  baseCostsFixture,
  dailyExpensesFixture,
  expensesFixture,
  LISBON_BASE_TOTAL_IN_CENTS,
  LISBON_DAILY_TOTAL_IN_CENTS,
} from "./expenses";
import { tripsFixture } from "./trips";

const sum = (values: { amountInCents: number }[]) =>
  values.reduce((total, { amountInCents }) => total + amountInCents, 0);

describe("fixtures", () => {
  it("match their schemas", () => {
    tripsFixture.forEach((trip) => tripSchema.parse(trip));
    categoriesFixture.forEach((category) => categorySchema.parse(category));
    expensesFixture.forEach((expense) => expenseSchema.parse(expense));
  });

  it("add up to the Lisboa & Sintra totals", () => {
    expect(baseCostsFixture).toHaveLength(10);
    expect(dailyExpensesFixture).toHaveLength(31);
    expect(sum(baseCostsFixture)).toBe(LISBON_BASE_TOTAL_IN_CENTS);
    expect(sum(dailyExpensesFixture)).toBe(LISBON_DAILY_TOTAL_IN_CENTS);
  });

  it("only reference existing categories", () => {
    const ids = new Set(categoriesFixture.map((category) => category.id));
    expensesFixture.forEach((expense) => expect(ids.has(expense.categoryId)).toBe(true));
  });
});
