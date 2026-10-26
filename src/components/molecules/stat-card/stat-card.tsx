import { Money } from "@/components/atoms/money";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type StatCardProps = Omit<React.ComponentProps<"div">, "children"> & {
  /** Rendered icon element, e.g. `<Plane />`. */
  icon: React.ReactNode;
  label: string;
  valueInCents: number;
  currency: CurrencyCode;
  description: string;
  /** Shorter supporting line used below md. Falls back to `description`. */
  compactDescription?: string;
};

/** Small totals tile: icon, label, big amount and a supporting line. */
export function StatCard({
  icon,
  label,
  valueInCents,
  currency,
  description,
  compactDescription,
  className,
  ...props
}: StatCardProps) {
  const shortText = compactDescription ?? description;
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-2 rounded-xl border border-border bg-card p-4 md:rounded-2xl md:p-5.5",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-[12px] bg-primary-soft text-primary md:size-10 md:rounded-[13px] [&_svg]:size-4.5 md:[&_svg]:size-5"
      >
        {icon}
      </span>
      <span className="text-[13px] font-semibold text-muted-foreground md:text-sm">{label}</span>
      <Money
        amount={valueInCents}
        currency={currency}
        className="text-[21px] font-bold tracking-[-0.4px] md:text-[28px] md:tracking-[-0.6px]"
      />
      {compactDescription === undefined ? (
        <span className="text-xs leading-[1.45] text-muted-foreground md:text-[13px]">
          {description}
        </span>
      ) : (
        <>
          <span className="text-xs leading-[1.45] text-muted-foreground md:hidden">
            {shortText}
          </span>
          <span className="hidden text-[13px] leading-[1.45] text-muted-foreground md:block">
            {description}
          </span>
        </>
      )}
    </div>
  );
}
