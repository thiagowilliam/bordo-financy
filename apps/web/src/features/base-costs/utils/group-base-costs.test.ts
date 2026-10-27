import { describe, expect, it } from "vitest";

import type { BaseCost } from "../types";
import { categoriesFixture } from "@/mocks/fixtures/categories";
import { baseCostsFixture, LISBON_BASE_TOTAL_IN_CENTS } from "@/mocks/fixtures/expenses";

import { formatPaidOn, formatShareLabel, groupBaseCosts } from "./group-base-costs";

const overview = groupBaseCosts(baseCostsFixture as BaseCost[], categoriesFixture);

describe("groupBaseCosts", () => {
  it("totals the costs and counts the items", () => {
    expect(overview.totalInCents).toBe(LISBON_BASE_TOTAL_IN_CENTS);
    expect(overview.itemCount).toBe(baseCostsFixture.length);
  });

  it("orders groups by subtotal and keeps every item", () => {
    const subtotals = overview.groups.map((group) => group.subtotalInCents);
    expect(subtotals).toEqual(subtotals.toSorted((a, b) => b - a));
    expect(overview.groups.flatMap((group) => group.items)).toHaveLength(baseCostsFixture.length);
    expect(subtotals.reduce((sum, value) => sum + value, 0)).toBe(LISBON_BASE_TOTAL_IN_CENTS);
  });

  it("orders items inside a group by payment date", () => {
    for (const group of overview.groups) {
      const dates = group.items.map((item) => item.date);
      expect(dates).toEqual(dates.toSorted());
    }
  });

  it("computes each share of the total", () => {
    const [first] = overview.groups;
    expect(first.sharePercent).toBe(
      Math.round((first.subtotalInCents / LISBON_BASE_TOTAL_IN_CENTS) * 1000) / 10,
    );
  });

  it("handles no costs", () => {
    expect(groupBaseCosts([], categoriesFixture)).toEqual({
      totalInCents: 0,
      itemCount: 0,
      groups: [],
    });
  });
});

describe("labels", () => {
  it("formats the payment date and the share", () => {
    expect(formatPaidOn("2026-07-14")).toBe("Pago em 14 jul");
    expect(formatShareLabel(45.5)).toBe("45,5% do total");
    expect(formatShareLabel(6)).toBe("6,0% do total");
  });
});
