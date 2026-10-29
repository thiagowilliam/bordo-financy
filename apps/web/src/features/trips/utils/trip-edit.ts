import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { formatMoney } from "@/lib/money";
import { paymentMethodLabels } from "@/lib/payment-methods";
import type { Expense } from "@/features/expenses";

import type { BudgetChange, Trip } from "../types";
import { getTripPhase, type TripPhase } from "./trip-status";

type TripDates = Pick<Trip, "startDate" | "endDate">;

/** How many expenses fall outside `dates` (both ends are part of the trip). */
export function countExpensesOutside(expenses: Pick<Expense, "date">[], dates: TripDates): number {
  return expenses.filter(
    (expense) => expense.date < dates.startDate || expense.date > dates.endDate,
  ).length;
}

export const outsidePeriodMessage = (count: number) =>
  `${count} ${count === 1 ? "gasto ficaria fora" : "gastos ficariam fora"} do novo período. Ajuste as datas ou mova ${count === 1 ? "esse gasto" : "esses gastos"} antes de salvar.`;

const phaseSentence: Record<TripPhase, string> = {
  upcoming: "Próxima",
  ongoing: "Em andamento",
  completed: "Concluída",
};

/** Heads-up when the new dates move the trip to another status; `null` when nothing changes. */
export function describePhaseChange(
  current: TripDates,
  next: TripDates,
  today: string,
): string | null {
  const before = getTripPhase(current, today);
  const after = getTripPhase(next, today);
  if (before === after) return null;
  return `Com essas datas, a viagem passará para ${phaseSentence[after]}.`;
}

/** "Orçamento ajustado de € 4.500,00 para € 5.000,00 em 20 out." */
export function formatBudgetChangeNote(change: BudgetChange, currency: string): string {
  const day = format(parseISO(change.changedAt), "d MMM", { locale: ptBR }).replace(".", "");
  return `Orçamento ajustado de ${formatMoney(change.fromInCents, currency)} para ${formatMoney(change.toInCents, currency)} em ${day}.`;
}

type CsvCategory = { id: string; name: string };

const csvCell = (value: string) =>
  /[",\n;]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

/** Every expense of the trip (daily and base) as CSV, oldest first. Amounts keep the currency digits. */
export function buildExpensesCsv(
  expenses: Expense[],
  categories: CsvCategory[],
  currency: string,
): string {
  const rows = expenses
    .toSorted((a, b) => a.date.localeCompare(b.date))
    .map((expense) => [
      expense.date,
      expense.kind === "BASE" ? "Custo de base" : "Dia a dia",
      categories.find((category) => category.id === expense.categoryId)?.name ?? "Sem categoria",
      paymentMethodLabels[expense.paymentMethod],
      formatMoney(expense.amountInCents, currency).replace(/\s/g, " "),
      expense.description,
    ]);
  return [["Data", "Tipo", "Categoria", "Pagamento", "Valor", "Descrição"], ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\n");
}
