import { Banknote, CreditCard, Globe, QrCode, type LucideIcon } from "lucide-react";

import { CategoryIcon, type CategoryIconName } from "@/components/atoms/category-icon";
import { Money } from "@/components/atoms/money";
import type { PaymentMethod } from "@/features/expenses";
import { paymentMethodIconNames, paymentMethodLabels } from "@/lib/payment-methods";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

const paymentIcons: Record<(typeof paymentMethodIconNames)[PaymentMethod], LucideIcon> = {
  banknote: Banknote,
  "qr-code": QrCode,
  "credit-card": CreditCard,
  globe: Globe,
};

export type EntryRowProps = Omit<React.ComponentProps<"div">, "children"> & {
  description: string;
  categoryName: string;
  categoryIcon: CategoryIconName;
  /** Category color token index (chart-1..8). */
  categoryColor: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  paymentMethod: PaymentMethod;
  amountInCents: number;
  currency: CurrencyCode;
  /** Desktop-only controls (edit, delete) revealed on hover or focus within. */
  actions?: React.ReactNode;
};

/** One daily expense line: category tile, title, category and payment meta, amount. */
export function EntryRow({
  description,
  categoryName,
  categoryIcon,
  categoryColor,
  paymentMethod,
  amountInCents,
  currency,
  actions,
  className,
  ...props
}: EntryRowProps) {
  const PaymentIcon = paymentIcons[paymentMethodIconNames[paymentMethod]];
  return (
    <div
      className={cn(
        "group flex items-center gap-3.5 py-3.5",
        actions && "md:hover:bg-background",
        className,
      )}
      {...props}
    >
      <CategoryIcon icon={categoryIcon} color={categoryColor} tone="soft" size="md" />
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <span className="truncate text-base font-semibold text-foreground">{description}</span>
        <span className="flex items-center gap-1.5 text-[13px] text-muted-foreground">
          <span className="truncate">{categoryName}</span>
          <span aria-hidden className="text-subtle-foreground">
            ·
          </span>
          <PaymentIcon aria-hidden className="size-3.5 shrink-0" />
          <span className="shrink-0">{paymentMethodLabels[paymentMethod]}</span>
        </span>
      </div>
      {actions ? (
        <div
          data-slot="entry-actions"
          className="hidden shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 md:flex"
        >
          {actions}
        </div>
      ) : null}
      <Money
        amount={amountInCents}
        currency={currency}
        className="shrink-0 text-right font-semibold"
      />
    </div>
  );
}
