import { describe, expect, it } from "vitest";

import { forgotPasswordSchema, signInSchema, signUpSchema } from "./auth.schema";

const messages = (result: { error?: { issues: { message: string }[] } }) =>
  result.error?.issues.map((issue) => issue.message);

describe("signInSchema", () => {
  it("trims the e-mail and requires a password", () => {
    expect(signInSchema.parse({ email: " a@b.com ", password: "x" }).email).toBe("a@b.com");
    expect(messages(signInSchema.safeParse({ email: "", password: "" }))).toEqual([
      "Informe seu e-mail",
      "Informe sua senha",
    ]);
  });
});

describe("signUpSchema", () => {
  const valid = { email: "a@b.com", password: "12345678", confirmPassword: "12345678" };

  it("accepts matching passwords", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects short passwords", () => {
    const result = signUpSchema.safeParse({ ...valid, password: "123", confirmPassword: "123" });
    expect(messages(result)).toContain("Use ao menos 8 caracteres");
  });

  it("reports the mismatch on the confirmation field", () => {
    const result = signUpSchema.safeParse({ ...valid, confirmPassword: "87654321" });
    expect(result.error?.issues[0]).toMatchObject({
      path: ["confirmPassword"],
      message: "As senhas não coincidem.",
    });
  });
});

describe("forgotPasswordSchema", () => {
  it("validates the e-mail", () => {
    expect(forgotPasswordSchema.safeParse({ email: "a@b.com" }).success).toBe(true);
    expect(messages(forgotPasswordSchema.safeParse({ email: "a@" }))).toEqual(["E-mail inválido"]);
  });
});
