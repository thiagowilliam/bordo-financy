/**
 * A cell that starts with one of these is run as a formula by spreadsheet apps. Prefixing a quote
 * keeps user typed text (a description) from becoming one when the file is opened.
 */
const FORMULA_START = /^[=+\-@\t\r]/;

export function csvCell(value: string | number): string {
  let text = String(value);
  if (typeof value === "string" && FORMULA_START.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export const csvRow = (cells: (string | number)[]) => cells.map(csvCell).join(",");

/** Digits after the decimal point of a currency (2 for BRL, 0 for JPY and CLP). */
export function currencyDigits(currency: string): number {
  try {
    return (
      new Intl.NumberFormat("en", { style: "currency", currency }).resolvedOptions()
        .maximumFractionDigits ?? 2
    );
  } catch {
    return 2;
  }
}

/** Integer minor units to a plain decimal string, without float math. */
export function formatMinorUnits(amount: number, currency: string): string {
  const digits = currencyDigits(currency);
  if (digits === 0) return String(amount);
  const negative = amount < 0;
  const padded = String(Math.abs(amount)).padStart(digits + 1, "0");
  const whole = padded.slice(0, -digits);
  const fraction = padded.slice(-digits);
  return `${negative ? "-" : ""}${whole}.${fraction}`;
}
