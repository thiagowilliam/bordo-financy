import { describe, expect, it } from "vitest";

import { createTripSchema } from "./trip.schema";

const valid = {
  name: "  Santorini  ",
  destination: "Grécia",
  startDate: "2027-05-01",
  endDate: "2027-05-10",
  budgetInCents: 540000,
  currency: "EUR",
};

const messages = (input: unknown) => {
  const result = createTripSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((issue) => issue.message);
};

describe("createTripSchema", () => {
  it("trims text and accepts a valid trip", () => {
    expect(createTripSchema.parse(valid).name).toBe("Santorini");
  });

  it("requires every field with pt-BR messages", () => {
    expect(
      messages({
        name: " ",
        destination: "",
        startDate: "",
        endDate: "",
        budgetInCents: 0,
        currency: "BRL",
      }),
    ).toEqual([
      "Informe o nome da viagem",
      "Informe o destino",
      "Informe a data de ida",
      "Informe a data de volta",
      "Informe um orçamento maior que zero",
    ]);
  });

  it("rejects unsupported currencies", () => {
    expect(messages({ ...valid, currency: "XXX" })).toEqual(["Selecione a moeda"]);
  });

  it("rejects an end date before the start date", () => {
    expect(messages({ ...valid, endDate: "2027-04-30" })).toEqual([
      "A data de volta não pode ser antes da ida",
    ]);
  });

  it("allows a one day trip", () => {
    expect(messages({ ...valid, endDate: valid.startDate })).toEqual([]);
  });
});
