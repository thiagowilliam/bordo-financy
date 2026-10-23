import type { z } from "zod";

import type {
  createExpenseSchema,
  expenseFiltersSchema,
  expenseKindSchema,
  expenseSchema,
  paymentMethodSchema,
} from "../schemas/expense.schema";

export type Expense = z.infer<typeof expenseSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type ExpenseKind = z.infer<typeof expenseKindSchema>;
export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type ExpenseFilters = z.infer<typeof expenseFiltersSchema>;
