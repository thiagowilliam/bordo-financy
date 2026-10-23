export type BudgetStatus = "ok" | "warning" | "over";

export const BUDGET_WARNING_RATIO = 0.8;

/** Within budget below 80%, warning from 80% up to 100%, over budget above 100%. */
export function getBudgetStatus(spentInCents: number, budgetInCents: number): BudgetStatus {
  if (budgetInCents <= 0) return spentInCents > 0 ? "over" : "ok";
  const ratio = spentInCents / budgetInCents;
  if (ratio > 1) return "over";
  if (ratio >= BUDGET_WARNING_RATIO) return "warning";
  return "ok";
}
