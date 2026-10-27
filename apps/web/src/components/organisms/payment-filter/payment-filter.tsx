"use client";

import { Banknote, Check, CreditCard, Globe, QrCode, Wallet } from "lucide-react";
import { useState } from "react";

import { FilterButton } from "@/components/molecules/filter-button";
import { FilterSurface } from "@/components/molecules/filter-surface";
import type { PaymentMethod } from "@/features/expenses";
import { paymentMethodIconNames, paymentMethodLabels, paymentMethods } from "@/lib/payment-methods";
import { cn } from "@/lib/utils";

const icons = {
  banknote: Banknote,
  "qr-code": QrCode,
  "credit-card": CreditCard,
  globe: Globe,
} as const satisfies Record<(typeof paymentMethodIconNames)[PaymentMethod], unknown>;

export type PaymentFilterProps = {
  value: PaymentMethod | undefined;
  onValueChange: (method: PaymentMethod | undefined) => void;
  className?: string;
};

export function PaymentFilter({ value, onValueChange, className }: PaymentFilterProps) {
  const [open, setOpen] = useState(false);

  const select = (method: PaymentMethod) => {
    onValueChange(method);
    setOpen(false);
  };

  const clear = () => {
    onValueChange(undefined);
    setOpen(false);
  };

  return (
    <FilterSurface
      open={open}
      onOpenChange={setOpen}
      title="Pagamento"
      popoverClassName="w-64"
      mobileAction={
        <button
          type="button"
          onClick={clear}
          className="rounded-md text-sm font-semibold text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          Limpar
        </button>
      }
      trigger={
        <FilterButton
          icon={<Wallet />}
          label="Pagamento"
          active={value !== undefined}
          open={open}
          className={className}
        />
      }
    >
      {(isDesktop) => (
        <div className="flex flex-col gap-1">
          <div role="radiogroup" aria-label="Forma de pagamento" className="flex flex-col gap-0.5">
            {paymentMethods.map((method) => {
              const Icon = icons[paymentMethodIconNames[method]];
              const selected = value === method;
              return (
                <button
                  key={method}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => select(method)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-2.5 py-2.5 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected
                      ? "bg-primary-soft font-bold text-primary-strong"
                      : "font-medium text-foreground hover:bg-muted",
                  )}
                >
                  <Icon
                    aria-hidden
                    className={cn("size-4", selected ? "text-primary" : "text-muted-foreground")}
                  />
                  <span className="flex-1">{paymentMethodLabels[method]}</span>
                  {selected ? <Check aria-hidden className="size-4 text-primary" /> : null}
                </button>
              );
            })}
          </div>
          {isDesktop ? (
            <>
              <hr className="my-1 border-border" />
              <button
                type="button"
                onClick={clear}
                disabled={value === undefined}
                className="self-start rounded-md px-1 py-1 text-[13px] font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
              >
                Limpar
              </button>
            </>
          ) : null}
        </div>
      )}
    </FilterSurface>
  );
}
