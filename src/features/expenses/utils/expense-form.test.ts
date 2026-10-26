import { describe, expect, it } from "vitest";

import { expenseFormSchema, type ExpenseFormValues } from "../schemas/expense-form.schema";
import type { Expense } from "../types";
import { toCreateExpenseInput, toExpenseFormValues } from "./expense-form";

const valid: ExpenseFormValues = {
  kind: "DAILY",
  categoryId: "cat-alimentacao",
  paymentMethod: "CREDIT",
  amountInCents: 1850,
  date: "2026-10-22",
  description: "  Almoço no Time Out Market ",
};

describe("expenseFormSchema", () => {
  it("accepts a complete expense", () => {
    expect(expenseFormSchema.safeParse(valid).success).toBe(true);
  });

  it("asks for the amount, category and payment method", () => {
    const result = expenseFormSchema.safeParse({
      ...valid,
      categoryId: "",
      paymentMethod: undefined,
      amountInCents: 0,
    });
    expect(result.success).toBe(false);
    const messages = result.error?.issues.map((issue) => issue.message);
    expect(messages).toContain("Selecione a categoria");
    expect(messages).toContain("Selecione a forma de pagamento");
    expect(messages).toContain("Informe um valor maior que zero");
  });

  it("allows an empty description", () => {
    expect(expenseFormSchema.safeParse({ ...valid, description: "" }).success).toBe(true);
  });
});

describe("toCreateExpenseInput", () => {
  const context = { tripId: "trip-1", currency: "EUR", categoryName: "Alimentação" };

  it("trims the description and adds trip and currency", () => {
    expect(toCreateExpenseInput(valid, context)).toEqual({
      tripId: "trip-1",
      kind: "DAILY",
      categoryId: "cat-alimentacao",
      paymentMethod: "CREDIT",
      amountInCents: 1850,
      currency: "EUR",
      date: "2026-10-22",
      description: "Almoço no Time Out Market",
    });
  });

  it("falls back to the category name when there is no description", () => {
    expect(toCreateExpenseInput({ ...valid, description: " " }, context).description).toBe(
      "Alimentação",
    );
  });

  it("requires a payment method", () => {
    expect(() => toCreateExpenseInput({ ...valid, paymentMethod: undefined }, context)).toThrow();
  });
});

describe("toExpenseFormValues", () => {
  const expense: Expense = {
    id: "daily-1",
    tripId: "trip-1",
    kind: "DAILY",
    categoryId: "cat-alimentacao",
    paymentMethod: "PIX",
    amountInCents: 900,
    currency: "EUR",
    date: "2026-10-21",
    description: "Alimentação",
  };

  it("hides a description that only repeats the category", () => {
    expect(toExpenseFormValues(expense, "Alimentação").description).toBe("");
    expect(
      toExpenseFormValues({ ...expense, description: "Café" }, "Alimentação").description,
    ).toBe("Café");
  });
});
