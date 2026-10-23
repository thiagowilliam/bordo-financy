import { describe, expect, it } from "vitest";

import { getBudgetStatus } from "./budget";

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
