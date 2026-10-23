import type { Expense, PaymentMethod } from "@/features/expenses";

import { LISBON_TRIP_ID } from "./trips";

/** Base costs add up to € 2.604,90 and daily expenses to € 1.016,40 (total € 3.621,30). */
export const LISBON_BASE_TOTAL_IN_CENTS = 260490;
export const LISBON_DAILY_TOTAL_IN_CENTS = 101640;

const baseCost = (
  n: number,
  categoryId: string,
  description: string,
  amountInCents: number,
  paymentMethod: PaymentMethod,
  date: string,
): Expense => ({
  id: `base-${n}`,
  tripId: LISBON_TRIP_ID,
  kind: "BASE",
  categoryId,
  paymentMethod,
  amountInCents,
  currency: "EUR",
  date,
  description,
});

export const baseCostsFixture: Expense[] = [
  baseCost(1, "cat-passagem", "Passagem aérea São Paulo ⇄ Lisboa", 98000, "CREDIT", "2026-02-10"),
  baseCost(
    2,
    "cat-hospedagem",
    "Apartamento em Alfama, 5 noites",
    74000,
    "INTERNATIONAL_CARD",
    "2026-03-02",
  ),
  baseCost(
    3,
    "cat-hospedagem",
    "Pousada em Sintra, 2 noites",
    14200,
    "INTERNATIONAL_CARD",
    "2026-03-02",
  ),
  baseCost(4, "cat-aluguel-carro", "Carro compacto, 4 dias", 31500, "CREDIT", "2026-03-15"),
  baseCost(5, "cat-seguro", "Seguro viagem Europa", 9800, "PIX", "2026-04-01"),
  baseCost(6, "cat-conectividade", "eSIM 20 GB", 2490, "CREDIT", "2026-05-05"),
  baseCost(
    7,
    "cat-transfer",
    "Transfer aeroporto ⇄ hotel",
    4500,
    "INTERNATIONAL_CARD",
    "2026-05-06",
  ),
  baseCost(
    8,
    "cat-ingressos",
    "Palácio da Pena e Quinta da Regaleira",
    9600,
    "INTERNATIONAL_CARD",
    "2026-04-20",
  ),
  baseCost(
    9,
    "cat-ingressos",
    "Tour de tuk-tuk em Alfama",
    9000,
    "INTERNATIONAL_CARD",
    "2026-04-20",
  ),
  baseCost(10, "cat-transfer", "Passe de transporte Viva Viagem", 7400, "DEBIT", "2026-05-12"),
];

const dailyPlan: [categoryId: string, description: string, paymentMethod: PaymentMethod][] = [
  ["cat-alimentacao", "Pastéis de nata", "INTERNATIONAL_CARD"],
  ["cat-alimentacao", "Almoço no Time Out Market", "INTERNATIONAL_CARD"],
  ["cat-transporte", "Metro e elétrico 28", "DEBIT"],
  ["cat-passeios", "Mirador e museu", "INTERNATIONAL_CARD"],
  ["cat-compras", "Azulejos e lembranças", "CASH"],
  ["cat-combustivel", "Abastecimento", "CREDIT"],
  ["cat-gorjetas", "Gorjeta no jantar", "CASH"],
  ["cat-saude", "Farmácia", "DEBIT"],
];

const DAILY_COUNT = 31;

/** Deterministic amounts; the last entry absorbs the remainder so the total is exact. */
function dailyAmounts() {
  const amounts = Array.from({ length: DAILY_COUNT - 1 }, (_, i) => 1100 + ((i * 1031) % 4200));
  const used = amounts.reduce((sum, amount) => sum + amount, 0);
  return [...amounts, LISBON_DAILY_TOTAL_IN_CENTS - used];
}

export const dailyExpensesFixture: Expense[] = dailyAmounts().map((amountInCents, i) => {
  const [categoryId, description, paymentMethod] = dailyPlan[i % dailyPlan.length];
  const day = 12 + (i % 8);
  return {
    id: `daily-${i + 1}`,
    tripId: LISBON_TRIP_ID,
    kind: "DAILY",
    categoryId,
    paymentMethod,
    amountInCents,
    currency: "EUR",
    date: `2026-05-${String(day).padStart(2, "0")}`,
    description,
  };
});

export const expensesFixture: Expense[] = [...baseCostsFixture, ...dailyExpensesFixture];
