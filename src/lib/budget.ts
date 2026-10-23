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

export type BudgetSummary = {
  status: BudgetStatus;
  /** Rounded percentage of the budget already spent, e.g. 72. */
  percentUsed: number;
  /** Ratio between 0 and 1 for progress bars (never above 1). */
  progress: number;
  /** Budget minus spent; negative when over budget. */
  remainingInCents: number;
};

export function getBudgetSummary(spentInCents: number, budgetInCents: number): BudgetSummary {
  const ratio = budgetInCents > 0 ? spentInCents / budgetInCents : spentInCents > 0 ? 1 : 0;
  return {
    status: getBudgetStatus(spentInCents, budgetInCents),
    percentUsed: Math.round(ratio * 100),
    progress: Math.min(ratio, 1),
    remainingInCents: budgetInCents - spentInCents,
  };
}
