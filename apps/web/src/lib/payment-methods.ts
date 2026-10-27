import type { PaymentMethod } from "@/features/expenses";

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Dinheiro",
  PIX: "Pix",
  DEBIT: "Débito",
  CREDIT: "Crédito",
  INTERNATIONAL_CARD: "Cartão internacional",
};

/** Lucide icon names, rendered by the caller (CLAUDE.md: icons cross boundaries as elements). */
export const paymentMethodIconNames = {
  CASH: "banknote",
  PIX: "qr-code",
  DEBIT: "credit-card",
  CREDIT: "credit-card",
  INTERNATIONAL_CARD: "globe",
} as const satisfies Record<PaymentMethod, string>;

export const paymentMethods = Object.keys(paymentMethodLabels) as PaymentMethod[];
