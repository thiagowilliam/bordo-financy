import { describe, expect, it } from "vitest";

import { digitsToMinorUnits, minorUnitsToDisplay } from "./money-input";

describe("digitsToMinorUnits", () => {
  it("reads digits cents-first and ignores everything else", () => {
    expect(digitsToMinorUnits("€ 5.400,00")).toBe(540000);
    expect(digitsToMinorUnits("abc")).toBe(0);
    expect(digitsToMinorUnits("")).toBe(0);
    expect(digitsToMinorUnits("0007")).toBe(7);
  });

  it("caps the amount to 12 digits", () => {
    expect(digitsToMinorUnits("1234567890123456")).toBe(123456789012);
  });
});

describe("minorUnitsToDisplay", () => {
  it("formats with the currency fraction digits", () => {
    expect(minorUnitsToDisplay(540000, "EUR").replace(/\s/g, " ")).toBe("€ 5.400,00");
    expect(minorUnitsToDisplay(5, "BRL").replace(/\s/g, " ")).toBe("R$ 0,05");
  });

  it("has no fraction for JPY", () => {
    expect(minorUnitsToDisplay(540000, "JPY").replace(/\s/g, " ")).toBe("¥ 540.000");
  });

  it("is empty for zero", () => {
    expect(minorUnitsToDisplay(0, "EUR")).toBe("");
  });
});
