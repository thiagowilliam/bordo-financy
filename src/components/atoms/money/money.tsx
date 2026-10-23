import { cva, type VariantProps } from "class-variance-authority";

import { formatMoney, type CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

const moneyVariants = cva("financial-value", {
  variants: {
    size: {
      sm: "text-sm",
      md: "text-base",
      lg: "text-2xl font-bold tracking-tight",
      xl: "text-4xl font-bold tracking-tighter",
    },
    tone: {
      default: "text-foreground",
      muted: "text-muted-foreground",
      primary: "text-primary",
      success: "text-success-ink",
      warning: "text-warning-ink",
      destructive: "text-destructive-ink",
    },
  },
  defaultVariants: { size: "md", tone: "default" },
});

export type MoneyProps = Omit<React.ComponentProps<"span">, "children"> &
  VariantProps<typeof moneyVariants> & {
    /** Integer amount in cents. */
    amount: number;
    /** ISO 4217 currency code. */
    currency: CurrencyCode;
    hideCents?: boolean;
    /** Hides the fraction digits only when they are zero. */
    trimZeroCents?: boolean;
  };

export function Money({
  amount,
  currency,
  hideCents,
  trimZeroCents,
  size,
  tone,
  className,
  ...props
}: MoneyProps) {
  return (
    <span className={cn(moneyVariants({ size, tone }), className)} {...props}>
      {formatMoney(amount, currency, { hideCents, trimZeroCents })}
    </span>
  );
}
