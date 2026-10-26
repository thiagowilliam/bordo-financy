import type { ExpenseFormValues } from "../schemas/expense-form.schema";
import type { CreateExpenseInput, Expense } from "../types";

type ToExpenseInputContext = {
  tripId: string;
  currency: string;
  /** Used as the description when the user leaves it empty (the API requires one). */
  categoryName: string;
};

/** Maps validated form values to the API payload. */
export function toCreateExpenseInput(
  values: ExpenseFormValues,
  { tripId, currency, categoryName }: ToExpenseInputContext,
): CreateExpenseInput {
  if (!values.paymentMethod) throw new Error("Payment method is required");
  return {
    tripId,
    kind: values.kind,
    categoryId: values.categoryId,
    paymentMethod: values.paymentMethod,
    amountInCents: values.amountInCents,
    currency,
    date: values.date,
    description: values.description.trim() || categoryName,
  };
}

/** Form values for editing. A description equal to the category name was the empty fallback. */
export function toExpenseFormValues(expense: Expense, categoryName?: string): ExpenseFormValues {
  return {
    kind: expense.kind,
    categoryId: expense.categoryId,
    paymentMethod: expense.paymentMethod,
    amountInCents: expense.amountInCents,
    date: expense.date,
    description: expense.description === categoryName ? "" : expense.description,
  };
}
