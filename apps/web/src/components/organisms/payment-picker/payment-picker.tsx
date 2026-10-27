"use client";

import { Banknote, Check, CreditCard, Globe, QrCode, type LucideIcon } from "lucide-react";
import { useState, type KeyboardEvent } from "react";

import { FilterSurface } from "@/components/molecules/filter-surface";
import { PickerField } from "@/components/molecules/picker-field";
import type { PaymentMethod } from "@/features/expenses";
import { paymentMethodIconNames, paymentMethodLabels, paymentMethods } from "@/lib/payment-methods";
import { cn } from "@/lib/utils";

export type PaymentPickerProps = {
  value: PaymentMethod | undefined;
  onValueChange: (method: PaymentMethod) => void;
  error?: string;
  label?: string;
  className?: string;
};

const iconsByName: Record<(typeof paymentMethodIconNames)[PaymentMethod], LucideIcon> = {
  banknote: Banknote,
  "qr-code": QrCode,
  "credit-card": CreditCard,
  globe: Globe,
};

function MethodIcon({
  method,
  className,
}: {
  method: PaymentMethod | undefined;
  className?: string;
}) {
  const Icon = method ? iconsByName[paymentMethodIconNames[method]] : CreditCard;
  return <Icon aria-hidden className={className} />;
}

/** Payment method field: a picker listing the five methods with their icon. */
export function PaymentPicker({
  value,
  onValueChange,
  error,
  label = "Forma de pagamento",
  className,
}: PaymentPickerProps) {
  const [open, setOpen] = useState(false);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === "ArrowDown" ? 1 : event.key === "ArrowUp" ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
    const current = items.indexOf(document.activeElement as HTMLElement);
    items[(current + step + items.length) % items.length]?.focus();
  };

  return (
    <FilterSurface
      open={open}
      onOpenChange={setOpen}
      title={label}
      popoverClassName="w-[320px] max-w-[calc(100vw-2rem)] p-2"
      trigger={
        <PickerField
          label={label}
          placeholder="Selecionar forma de pagamento"
          valueLabel={value ? paymentMethodLabels[value] : undefined}
          icon={<MethodIcon method={value} />}
          error={error}
          aria-haspopup="dialog"
          aria-expanded={open}
          className={className}
        />
      }
    >
      <div
        role="radiogroup"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="flex flex-col gap-0.5"
      >
        {paymentMethods.map((method, index) => {
          const selected = method === value;
          return (
            <button
              key={method}
              type="button"
              role="radio"
              aria-checked={selected}
              tabIndex={selected || (!value && index === 0) ? 0 : -1}
              autoFocus={selected || (!value && index === 0)}
              onClick={() => {
                onValueChange(method);
                setOpen(false);
              }}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                selected ? "bg-primary-soft" : "hover:bg-secondary",
              )}
            >
              <MethodIcon
                method={method}
                className={cn(
                  "size-[18px] shrink-0",
                  selected ? "text-primary" : "text-muted-foreground",
                )}
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-foreground",
                  selected ? "font-bold" : "font-medium",
                )}
              >
                {paymentMethodLabels[method]}
              </span>
              {selected ? <Check aria-hidden className="size-4 shrink-0 text-primary" /> : null}
            </button>
          );
        })}
      </div>
    </FilterSurface>
  );
}
