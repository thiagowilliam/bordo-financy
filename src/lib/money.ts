export type CurrencyCode = string;

type FormatMoneyOptions = {
  /** Hide the cents, e.g. "€ 1.016". */
  hideCents?: boolean;
};

/** Formats an integer amount in cents as pt-BR currency. Never pass floats. */
export function formatMoney(
  amountInCents: number,
  currency: CurrencyCode,
  { hideCents = false }: FormatMoneyOptions = {},
): string {
  if (!Number.isInteger(amountInCents)) {
    throw new RangeError("Money amount must be an integer in cents");
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: hideCents ? 0 : 2,
    maximumFractionDigits: hideCents ? 0 : 2,
  }).format(amountInCents / 100);
}
