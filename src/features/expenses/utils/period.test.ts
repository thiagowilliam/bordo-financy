import { describe, expect, it } from "vitest";

import { resolvePeriod } from "./period";

const context = { today: "2026-10-22", trip: { startDate: "2026-10-12", endDate: "2026-10-26" } };

describe("resolvePeriod", () => {
  it("returns no range without a period", () => {
    expect(resolvePeriod(null, context)).toEqual({});
  });

  it("resolves presets relative to today", () => {
    expect(resolvePeriod({ preset: "today" }, context)).toEqual({
      from: "2026-10-22",
      to: "2026-10-22",
    });
    expect(resolvePeriod({ preset: "yesterday" }, context)).toEqual({
      from: "2026-10-21",
      to: "2026-10-21",
    });
    expect(resolvePeriod({ preset: "last3" }, context)).toEqual({
      from: "2026-10-20",
      to: "2026-10-22",
    });
  });

  it("covers the whole trip", () => {
    expect(resolvePeriod({ preset: "all" }, context)).toEqual({
      from: "2026-10-12",
      to: "2026-10-26",
    });
  });

  it("orders a custom range and ignores an incomplete one", () => {
    expect(
      resolvePeriod({ preset: "custom", from: "2026-10-20", to: "2026-10-15" }, context),
    ).toEqual({ from: "2026-10-15", to: "2026-10-20" });
    expect(resolvePeriod({ preset: "custom", from: "2026-10-20" }, context)).toEqual({});
  });
});
