export type CurrencyCode = string;

type FormatMoneyOptions = {
  /** Always hide the fraction digits, e.g. "€ 1.016". */
  hideCents?: boolean;
  /** Hide the fraction digits only when they are zero, e.g. "€ 5.000" but "€ 3.621,30". */
  trimZeroCents?: boolean;
};

/** Currencies whose pt-BR symbol is shortened in the design (¥ instead of JP¥). */
const NARROW_SYMBOL_CURRENCIES = new Set(["JPY"]);

/** Number of fraction digits of a currency (2 for EUR, 0 for JPY). */
export function getCurrencyDigits(currency: CurrencyCode): number {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency }).resolvedOptions()
    .maximumFractionDigits!;
}

/**
 * Formats an integer amount in minor units (cents for EUR/BRL/USD, yen for JPY) as pt-BR
 * currency. Never pass floats.
 */
export function formatMoney(
  amountInMinorUnits: number,
  currency: CurrencyCode,
  { hideCents = false, trimZeroCents = false }: FormatMoneyOptions = {},
): string {
  if (!Number.isInteger(amountInMinorUnits)) {
    throw new RangeError("Money amount must be an integer in minor units");
  }
  const digits = getCurrencyDigits(currency);
  const value = amountInMinorUnits / 10 ** digits;
  const hasFraction = !Number.isInteger(value);
  const fractionDigits = hideCents || (trimZeroCents && !hasFraction) ? 0 : digits;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    currencyDisplay: NARROW_SYMBOL_CURRENCIES.has(currency) ? "narrowSymbol" : "symbol",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}
