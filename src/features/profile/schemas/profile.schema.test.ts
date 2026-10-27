import { describe, expect, it } from "vitest";

import { changeEmailSchema, updateProfileSchema } from "./profile.schema";

describe("updateProfileSchema", () => {
  it("trims the name and accepts a supported currency", () => {
    expect(updateProfileSchema.parse({ name: "  Marina  ", currency: "BRL" })).toEqual({
      name: "Marina",
      currency: "BRL",
    });
  });

  it("rejects an empty name and an unknown currency", () => {
    const result = updateProfileSchema.safeParse({ name: "   ", currency: "XXX" });
    expect(result.success).toBe(false);
    expect(result.error?.issues.map((issue) => issue.message)).toContain("Informe seu nome");
  });
});

describe("changeEmailSchema", () => {
  it("validates the address", () => {
    expect(changeEmailSchema.safeParse({ email: "nova@email.com" }).success).toBe(true);
    expect(changeEmailSchema.safeParse({ email: "nova@" }).success).toBe(false);
  });
});
