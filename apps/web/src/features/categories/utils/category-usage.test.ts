import { describe, expect, it } from "vitest";

import { getCategoryUsage } from "./category-usage";

describe("getCategoryUsage", () => {
  it("counts and totals expenses per category", () => {
    const usage = getCategoryUsage([
      { categoryId: "a", amountInCents: 1000 },
      { categoryId: "b", amountInCents: 250 },
      { categoryId: "a", amountInCents: 500 },
    ]);
    expect(usage.get("a")).toEqual({ count: 2, totalInCents: 1500 });
    expect(usage.get("b")).toEqual({ count: 1, totalInCents: 250 });
    expect(usage.get("c")).toBeUndefined();
  });

  it("returns an empty map without expenses", () => {
    expect(getCategoryUsage([]).size).toBe(0);
  });
});
