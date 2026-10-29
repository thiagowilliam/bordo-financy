"use client";

import { useId } from "react";

import { digitsToMinorUnits } from "@/lib/money-input";
import { getCurrencyDigits, type CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type AmountInputProps = {
  /** Amount in minor units (cents, or whole yen for JPY). Zero shows the placeholder. */
  value: number;
  currency: CurrencyCode;
  onValueChange: (minorUnits: number) => void;
  hint?: string;
  error?: string;
  id?: string;
  "aria-label"?: string;
  autoFocus?: boolean;
  className?: string;
};

function currencySymbol(currency: CurrencyCode) {
  const parts = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0);
  return parts.find((part) => part.type === "currency")?.value ?? currency;
}

function formatNumber(minorUnits: number, currency: CurrencyCode) {
  const digits = getCurrencyDigits(currency);
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(minorUnits / 10 ** digits);
}

/** Hero amount of the expense drawer: big masked number with the currency symbol beside it. */
export function AmountInput({
  value,
  currency,
  onValueChange,
  hint,
  error,
  id: idProp,
  "aria-label": ariaLabel = "Valor",
  autoFocus,
  className,
}: AmountInputProps) {
  const generatedId = useId();
  const id = idProp ?? generatedId;
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const placeholder = formatNumber(0, currency);
  const display = value > 0 ? formatNumber(value, currency) : "";
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className={cn("flex flex-col items-center gap-2 py-2", className)}>
      <div className="flex max-w-full items-center justify-center gap-2">
        <span
          aria-hidden
          className="text-[32px] font-semibold text-subtle-foreground md:text-[40px]"
        >
          {currencySymbol(currency)}
        </span>
        <input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          autoFocus={autoFocus}
          aria-label={ariaLabel}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          value={display}
          placeholder={placeholder}
          onChange={(event) => onValueChange(digitsToMinorUnits(event.target.value))}
          style={{ width: `${Math.max(display.length, placeholder.length) + 1}ch` }}
          className="min-w-0 border-0 bg-transparent p-0 text-center text-[52px] leading-none font-bold tracking-[-1.5px] text-foreground financial-value caret-cta outline-none placeholder:text-subtle-foreground md:text-[64px] md:tracking-[-2px]"
        />
      </div>
      {hint ? (
        <p id={hintId} className="text-center text-[13px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-center text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
