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

  it("uses the design symbols for USD and JPY and no fraction for yen", () => {
    expect(normalize(formatMoney(112000, "USD", { trimZeroCents: true }))).toBe("US$ 1.120");
    expect(normalize(formatMoney(214500, "JPY"))).toBe("¥ 214.500");
  });

  it("trims zero cents only when they are zero", () => {
    expect(normalize(formatMoney(500000, "EUR", { trimZeroCents: true }))).toBe("€ 5.000");
    expect(normalize(formatMoney(362130, "EUR", { trimZeroCents: true }))).toBe("€ 3.621,30");
  });

  it("formats negative amounts", () => {
    expect(normalize(formatMoney(-1000, "EUR"))).toContain("10,00");
  });

  it("rejects non integer amounts", () => {
    expect(() => formatMoney(10.5, "EUR")).toThrow(RangeError);
  });
});
