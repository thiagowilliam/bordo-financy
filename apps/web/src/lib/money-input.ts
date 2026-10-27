import { formatMoney, type CurrencyCode } from "./money";

/** Keeps amounts far below Number.MAX_SAFE_INTEGER so they stay exact integers. */
const MAX_DIGITS = 12;

/**
 * Turns whatever the user typed into an integer in minor units: every digit counts, anything
 * else is dropped. Typing "540000" yields 540000 (R$ 5.400,00, or ¥ 540.000 for JPY).
 */
export function digitsToMinorUnits(text: string): number {
  const digits = text.replace(/\D/g, "").slice(0, MAX_DIGITS);
  return digits === "" ? 0 : Number(digits);
}

/** Display string of an amount in minor units, or an empty string for zero (shows the placeholder). */
export function minorUnitsToDisplay(minorUnits: number, currency: CurrencyCode): string {
  return minorUnits > 0 ? formatMoney(minorUnits, currency) : "";
}
