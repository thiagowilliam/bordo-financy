import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { createExpense, fetchExpenses } from "@/features/expenses/api/client";
import { LISBON_TRIP_ID } from "@/mocks/fixtures/trips";
import { server } from "@/mocks/server";

import {
  createCategory,
  deleteCategory,
  fetchCategories,
  setCategoryHidden,
  updateCategory,
} from "./client";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("categories api (msw)", () => {
  it("lists default categories of both kinds", async () => {
    const categories = await fetchCategories();
    expect(categories.filter((c) => c.kind === "DAILY").length).toBeGreaterThan(0);
    expect(categories.filter((c) => c.kind === "BASE").length).toBeGreaterThan(0);
    expect(categories.find((c) => c.id === "cat-alimentacao")).toMatchObject({
      isDefault: true,
      hidden: false,
    });
  });

  it("creates, edits and hides a category", async () => {
    const created = await createCategory({
      name: "Farmácia",
      icon: "pill",
      color: 6,
      kind: "DAILY",
    });
    expect(created).toMatchObject({ isDefault: false, hidden: false, kind: "DAILY" });

    const updated = await updateCategory(created.id, {
      name: "Farmácia 24h",
      icon: "heart",
      color: 2,
    });
    expect(updated).toMatchObject({ name: "Farmácia 24h", icon: "heart", color: 2 });

    expect((await setCategoryHidden(created.id, true)).hidden).toBe(true);
    await deleteCategory(created.id);
  });

  it("does not delete a default category", async () => {
    await expect(deleteCategory("cat-alimentacao")).rejects.toThrow();
  });

  it("asks where to move expenses before deleting a category in use", async () => {
    const category = await createCategory({
      name: "Souvenirs",
      icon: "gift",
      color: 3,
      kind: "DAILY",
    });
    const expense = await createExpense({
      tripId: LISBON_TRIP_ID,
      kind: "DAILY",
      categoryId: category.id,
      paymentMethod: "CASH",
      amountInCents: 500,
      currency: "EUR",
      date: "2026-10-22",
      description: "Ímã",
    });

    await expect(deleteCategory(category.id)).rejects.toThrow();
    await expect(deleteCategory(category.id, "cat-gorjetas-inexistente")).rejects.toThrow();
    // A base category cannot receive daily expenses.
    await expect(deleteCategory(category.id, "cat-hospedagem")).rejects.toThrow();

    const deleted = await deleteCategory(category.id, "cat-compras");
    expect(deleted).toEqual({ id: category.id, movedExpenses: 1 });
    const moved = (await fetchExpenses(LISBON_TRIP_ID)).find((e) => e.id === expense.id);
    expect(moved?.categoryId).toBe("cat-compras");
    expect((await fetchCategories()).some((c) => c.id === category.id)).toBe(false);
  });
});
