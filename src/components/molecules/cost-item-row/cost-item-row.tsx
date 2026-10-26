import { Money } from "@/components/atoms/money";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CostItemRowProps = Omit<React.ComponentProps<"div">, "children"> & {
  description: string;
  /** Preformatted, e.g. "Pago em 14 jul". */
  paidOnLabel: string;
  amountInCents: number;
  currency: CurrencyCode;
  /** Makes the row selectable (e.g. open the edit drawer). Content becomes a real button. */
  onSelect?: () => void;
  /** Desktop-only controls (edit, delete) revealed on hover or focus within. */
  actions?: React.ReactNode;
};

/** Ledger row for a single base cost. */
export function CostItemRow({
  description,
  paidOnLabel,
  amountInCents,
  currency,
  onSelect,
  actions,
  className,
  ...props
}: CostItemRowProps) {
  const content = (
    <>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-base font-semibold text-foreground">{description}</span>
        <span className="text-[13px] text-muted-foreground">{paidOnLabel}</span>
      </div>
      <Money
        amount={amountInCents}
        currency={currency}
        className="w-[92px] shrink-0 text-right text-base font-semibold md:w-[110px]"
      />
    </>
  );
  const actionsSlot = actions ? (
    <div
      data-slot="cost-actions"
      className="hidden shrink-0 items-center gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100 md:flex"
    >
      {actions}
    </div>
  ) : null;

  if (onSelect) {
    return (
      <div
        className={cn("group flex items-center gap-1.5 md:hover:bg-background", className)}
        {...props}
      >
        <button
          type="button"
          onClick={onSelect}
          aria-label={`Editar custo: ${description}`}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3.5 py-3 text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"
        >
          {content}
        </button>
        {actionsSlot}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "group flex items-center gap-3.5 py-3",
        actions && "md:hover:bg-background",
        className,
      )}
      {...props}
    >
      {content}
      {actionsSlot}
    </div>
  );
}
