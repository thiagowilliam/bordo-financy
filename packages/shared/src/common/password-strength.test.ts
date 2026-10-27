import { describe, expect, it } from "vitest";

import { evaluatePassword, isStrongPassword, PASSWORD_RULES } from "./password-strength";

describe("evaluatePassword", () => {
  it("exposes the four rules", () => {
    expect(PASSWORD_RULES.map((r) => r.id)).toEqual(["length", "case", "number", "special"]);
  });

  it("is empty with no characters", () => {
    const result = evaluatePassword("");
    expect(result).toMatchObject({ score: 0, level: "empty", levelLabel: "", isValid: false });
  });

  it("is weak with 1 or 2 rules", () => {
    expect(evaluatePassword("abc")).toMatchObject({ score: 0, level: "weak", levelLabel: "Fraca" });
    expect(evaluatePassword("abcdefgh")).toMatchObject({ score: 1, level: "weak" });
    expect(evaluatePassword("abcdefg1")).toMatchObject({ score: 2, level: "weak" });
  });

  it("is medium with 3 rules", () => {
    const result = evaluatePassword("Abcdefg1");
    expect(result).toMatchObject({
      score: 3,
      level: "medium",
      levelLabel: "Média",
      isValid: false,
    });
  });

  it("is strong with all rules", () => {
    const result = evaluatePassword("Abcdef1!");
    expect(result).toMatchObject({ score: 4, level: "strong", levelLabel: "Forte", isValid: true });
    expect(isStrongPassword("Abcdef1!")).toBe(true);
    expect(isStrongPassword("abcdef1!")).toBe(false);
  });

  it("is Unicode aware and ignores spaces as special", () => {
    const met = (p: string, id: string) => evaluatePassword(p).rules.find((r) => r.id === id)?.met;
    expect(met("Ágata", "case")).toBe(true);
    expect(met("a b", "special")).toBe(false);
    expect(met("a-b", "special")).toBe(true);
    expect(met("áé", "special")).toBe(false);
  });
});
