import { z } from "zod";

import { expenseKindSchema, paymentMethodSchema } from "./expense.schema";

/** What the "Lançar gasto" drawer edits. Trip and currency come from the open trip. */
export const expenseFormSchema = z.object({
  kind: expenseKindSchema,
  categoryId: z.string().min(1, "Selecione a categoria"),
  paymentMethod: paymentMethodSchema.or(
    z.undefined().refine(() => false, "Selecione a forma de pagamento"),
  ),
  /** Amount as an integer in minor units. */
  amountInCents: z.number("Informe o valor").int().positive("Informe um valor maior que zero"),
  date: z.string().min(1, "Informe a data").pipe(z.iso.date("Data inválida")),
  description: z.string().trim(),
});

export type ExpenseFormValues = z.input<typeof expenseFormSchema>;
