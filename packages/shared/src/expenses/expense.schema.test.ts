import { describe, expect, it } from "vitest";

import { createExpenseSchema } from "./expense.schema";

const valid = {
  tripId: "trip-1",
  kind: "DAILY",
  categoryId: "cat-1",
  paymentMethod: "CASH",
  amountInCents: 1250,
  currency: "EUR",
  date: "2026-10-13",
  description: "  Pastel de nata  ",
} as const;

describe("createExpenseSchema", () => {
  it("trims the description", () => {
    expect(createExpenseSchema.parse(valid).description).toBe("Pastel de nata");
  });

  it("rejects a description that is only spaces", () => {
    const result = createExpenseSchema.safeParse({ ...valid, description: "   " });
    expect(result.success ? [] : result.error.issues.map((issue) => issue.message)).toEqual([
      "Informe uma descrição",
    ]);
  });

  it("requires a positive integer amount", () => {
    expect(createExpenseSchema.safeParse({ ...valid, amountInCents: 0 }).success).toBe(false);
    expect(createExpenseSchema.safeParse({ ...valid, amountInCents: 1.5 }).success).toBe(false);
  });
});
