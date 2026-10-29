import { describe, expect, it } from "vitest";

import type { Expense } from "@/features/expenses";

import {
  buildExpensesCsv,
  countExpensesOutside,
  describePhaseChange,
  formatBudgetChangeNote,
  outsidePeriodMessage,
} from "./trip-edit";

const trip = { startDate: "2026-10-12", endDate: "2026-10-26" };

describe("countExpensesOutside", () => {
  it("counts only expenses before the start or after the end", () => {
    const expenses = [
      { date: "2026-10-12" },
      { date: "2026-10-26" },
      { date: "2026-10-11" },
      { date: "2026-10-27" },
    ];
    expect(countExpensesOutside(expenses, trip)).toBe(2);
    expect(countExpensesOutside(expenses, { startDate: "2026-10-01", endDate: "2026-10-31" })).toBe(
      0,
    );
  });
});

describe("outsidePeriodMessage", () => {
  it("agrees with the count", () => {
    expect(outsidePeriodMessage(3)).toBe(
      "3 gastos ficariam fora do novo período. Ajuste as datas ou mova esses gastos antes de salvar.",
    );
    expect(outsidePeriodMessage(1)).toContain("1 gasto ficaria fora");
  });
});

describe("describePhaseChange", () => {
  it("is null while the status stays the same", () => {
    expect(describePhaseChange(trip, { ...trip, endDate: "2026-10-28" }, "2026-10-20")).toBeNull();
  });

  it("names the new status", () => {
    expect(describePhaseChange(trip, { ...trip, endDate: "2026-10-19" }, "2026-10-20")).toBe(
      "Com essas datas, a viagem passará para Concluída.",
    );
    expect(
      describePhaseChange(trip, { startDate: "2026-11-01", endDate: "2026-11-05" }, "2026-10-20"),
    ).toBe("Com essas datas, a viagem passará para Próxima.");
  });
});

describe("formatBudgetChangeNote", () => {
  it("states both budgets and the day", () => {
    const note = formatBudgetChangeNote(
      { fromInCents: 450000, toInCents: 500000, changedAt: "2026-10-20T12:00:00.000Z" },
      "EUR",
    );
    expect(note.replace(/\s/g, " ")).toBe(
      "Orçamento ajustado de € 4.500,00 para € 5.000,00 em 20 out.",
    );
  });
});

describe("buildExpensesCsv", () => {
  it("writes a header, escapes cells and sorts by date", () => {
    const expense = (overrides: Partial<Expense>): Expense => ({
      id: "e",
      tripId: "t",
      kind: "DAILY",
      categoryId: "c1",
      paymentMethod: "PIX",
      amountInCents: 1250,
      currency: "EUR",
      date: "2026-10-13",
      description: 'Almoço "bom", com vinho',
      ...overrides,
    });
    const csv = buildExpensesCsv(
      [expense({}), expense({ date: "2026-10-12", kind: "BASE", description: "Hotel" })],
      [{ id: "c1", name: "Comida" }],
      "EUR",
    );
    const lines = csv.split("\n");
    expect(lines[0]).toBe("Data,Tipo,Categoria,Pagamento,Valor,Descrição");
    expect(lines[1]).toContain("2026-10-12,Custo de base,Comida,Pix");
    expect(lines[2]).toContain('"Almoço ""bom"", com vinho"');
  });
});
