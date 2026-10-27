import { describe, expect, it } from "vitest";

import { getBudgetStatus, getBudgetSummary } from "./budget";

describe("getBudgetStatus", () => {
  it("is ok below 80%", () => {
    expect(getBudgetStatus(7900, 10000)).toBe("ok");
  });

  it("warns from 80% up to 100%", () => {
    expect(getBudgetStatus(8000, 10000)).toBe("warning");
    expect(getBudgetStatus(10000, 10000)).toBe("warning");
  });

  it("is over above 100%", () => {
    expect(getBudgetStatus(10001, 10000)).toBe("over");
  });

  it("handles a missing budget", () => {
    expect(getBudgetStatus(0, 0)).toBe("ok");
    expect(getBudgetStatus(100, 0)).toBe("over");
  });
});

describe("getBudgetSummary", () => {
  it("summarizes the Lisboa & Sintra trip", () => {
    expect(getBudgetSummary(362130, 500000)).toEqual({
      status: "ok",
      percentUsed: 72,
      progress: 362130 / 500000,
      remainingInCents: 137870,
    });
  });

  it("caps the progress at 100% and reports the overspend", () => {
    const summary = getBudgetSummary(1894000, 1750000);
    expect(summary.status).toBe("over");
    expect(summary.percentUsed).toBe(108);
    expect(summary.progress).toBe(1);
    expect(summary.remainingInCents).toBe(-144000);
  });

  it("warns at 91%", () => {
    expect(getBudgetSummary(438040, 480000).status).toBe("warning");
  });
});
