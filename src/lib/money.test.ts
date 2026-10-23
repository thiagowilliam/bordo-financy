import { describe, expect, it } from "vitest";

import { formatMoney } from "./money";

const normalize = (value: string) => value.replace(/\s/g, " ");

describe("formatMoney", () => {
  it("formats cents as pt-BR currency", () => {
    expect(normalize(formatMoney(362130, "EUR"))).toBe("€ 3.621,30");
    expect(normalize(formatMoney(50000, "BRL"))).toBe("R$ 500,00");
  });

  it("can hide the cents", () => {
    expect(normalize(formatMoney(101640, "EUR", { hideCents: true }))).toBe("€ 1.016");
  });

  it("formats negative amounts", () => {
    expect(normalize(formatMoney(-1000, "EUR"))).toContain("10,00");
  });

  it("rejects non integer amounts", () => {
    expect(() => formatMoney(10.5, "EUR")).toThrow(RangeError);
  });
});
