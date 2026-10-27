import type { Category } from "../types";

type ExpenseLike = { categoryId: string; amountInCents: number };

export type CategoryUsage = { count: number; totalInCents: number };

/** How many expenses use each category, and how much they add up to. */
export function getCategoryUsage(expenses: ExpenseLike[]): Map<Category["id"], CategoryUsage> {
  const usage = new Map<string, CategoryUsage>();
  for (const expense of expenses) {
    const current = usage.get(expense.categoryId) ?? { count: 0, totalInCents: 0 };
    usage.set(expense.categoryId, {
      count: current.count + 1,
      totalInCents: current.totalInCents + expense.amountInCents,
    });
  }
  return usage;
}

export const emptyUsage: CategoryUsage = { count: 0, totalInCents: 0 };
