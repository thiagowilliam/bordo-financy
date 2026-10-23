import { TextField, type TextFieldProps } from "@/components/atoms/text-field";
import { digitsToMinorUnits, minorUnitsToDisplay } from "@/lib/money-input";
import type { CurrencyCode } from "@/lib/money";

export type MoneyInputProps = Omit<
  TextFieldProps,
  "value" | "defaultValue" | "onChange" | "type" | "inputMode"
> & {
  /** Amount in minor units (cents, or whole yen for JPY). Zero shows the placeholder. */
  value: number;
  currency: CurrencyCode;
  onValueChange: (minorUnits: number) => void;
};

/**
 * Money field with cents-first masking: the user types digits and the text is formatted live
 * ("€ 5.400,00"). The value is an integer, so changing the currency keeps the digits typed.
 */
export function MoneyInput({ value, currency, onValueChange, ...props }: MoneyInputProps) {
  return (
    <TextField
      type="text"
      inputMode="numeric"
      autoComplete="off"
      value={minorUnitsToDisplay(value, currency)}
      onChange={(event) => onValueChange(digitsToMinorUnits(event.target.value))}
      {...props}
    />
  );
}
