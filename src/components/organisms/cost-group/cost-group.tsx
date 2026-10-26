import { useId } from "react";

import { categoryFill, type CategoryColor } from "@/components/atoms/category-bar";
import { CategoryIcon, type CategoryIconName } from "@/components/atoms/category-icon";
import { Money } from "@/components/atoms/money";
import { CostItemRow, type CostItemRowProps } from "@/components/molecules/cost-item-row";
import type { CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CostGroupItem = CostItemRowProps & { id: string };

export type CostGroupProps = Omit<React.ComponentProps<"section">, "children" | "color"> & {
  name: string;
  icon: CategoryIconName;
  color: CategoryColor;
  /** Preformatted, e.g. "45,5% do total". */
  shareLabel: string;
  subtotalInCents: number;
  currency: CurrencyCode;
  items: CostGroupItem[];
};

/** Card grouping the base costs of one type, with a color stripe, subtotal and item rows. */
export function CostGroup({
  name,
  icon,
  color,
  shareLabel,
  subtotalInCents,
  currency,
  items,
  className,
  ...props
}: CostGroupProps) {
  const titleId = useId();
  return (
    <section
      aria-labelledby={titleId}
      className={cn("flex overflow-clip rounded-xl border border-border bg-card", className)}
      {...props}
    >
      <div aria-hidden className={cn("w-[5px] shrink-0 self-stretch", categoryFill[color])} />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 md:px-[22px] md:py-4">
          <CategoryIcon
            icon={icon}
            color={color}
            tone="soft"
            className="size-[34px] rounded-md md:size-[38px] [&_svg]:size-[17px] md:[&_svg]:size-[19px]"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-px">
            <h3
              id={titleId}
              className="truncate text-[15px] font-bold text-foreground md:text-base"
            >
              {name}
            </h3>
            <span className="text-[11px] text-muted-foreground md:text-xs">{shareLabel}</span>
          </div>
          <Money
            amount={subtotalInCents}
            currency={currency}
            tone="primary"
            className="text-base font-bold md:text-lg"
          />
        </div>
        <ul className="flex flex-col px-4 md:px-[22px]">
          {items.map(({ id, ...item }) => (
            <li key={id} className="border-b border-border last:border-b-0">
              <CostItemRow {...item} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
