import { SUPPORTED_CURRENCIES, type SupportedCurrency } from "@bordo/shared/common";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CurrencySelectProps = {
  value: SupportedCurrency;
  onValueChange: (value: SupportedCurrency) => void;
  id?: string;
  name?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

const isSupportedCurrency = (code: string): code is SupportedCurrency =>
  SUPPORTED_CURRENCIES.some((currency) => currency.code === code);

/** Select with the currencies Bordo supports. */
export function CurrencySelect({
  value,
  onValueChange,
  id,
  name,
  disabled,
  className,
  ...aria
}: CurrencySelectProps) {
  return (
    <Select
      value={value}
      name={name}
      disabled={disabled}
      onValueChange={(code) => {
        if (isSupportedCurrency(code)) onValueChange(code);
      }}
    >
      <SelectTrigger
        id={id}
        className={cn(
          "w-full rounded-lg border-border bg-card px-4 py-3.75 text-base text-foreground data-[size=default]:h-auto",
          className,
        )}
        {...aria}
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent position="popper">
        {SUPPORTED_CURRENCIES.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            {currency.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
