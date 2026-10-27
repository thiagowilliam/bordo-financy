import { EyeOff, Eye, Pencil, Trash2 } from "lucide-react";

import { CategoryIcon, type CategoryIconName } from "@/components/atoms/category-icon";
import { Money } from "@/components/atoms/money";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type CategoryRowProps = Omit<React.ComponentProps<"div">, "children" | "color"> & {
  name: string;
  icon: CategoryIconName;
  color: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  isDefault: boolean;
  hidden?: boolean;
  usageCount: number;
  /** Integer amount in cents. */
  totalInCents: number;
  currency: CurrencyCode;
  onEdit: () => void;
  onToggleHidden: () => void;
  onDelete: () => void;
};

const badgeClassName =
  "rounded-full px-[7px] py-0.5 text-[10px] leading-[14px] font-bold md:px-2 md:text-[11px]";

const actionClassName =
  "flex size-[34px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-muted-foreground outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50 md:size-[38px] md:rounded-md [&_svg]:size-4 md:[&_svg]:size-[17px]";

/** Category line of the settings list: color tile, name with badges, usage and row actions. */
export function CategoryRow({
  name,
  icon,
  color,
  isDefault,
  hidden = false,
  usageCount,
  totalInCents,
  currency,
  onEdit,
  onToggleHidden,
  onDelete,
  className,
  ...props
}: CategoryRowProps) {
  const count = `${usageCount} ${usageCount === 1 ? "lançamento" : "lançamentos"}`;
  const total = formatMoney(totalInCents, currency);

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 pr-2.5 pl-3.5 md:gap-4 md:px-5 md:py-3.5",
        className,
      )}
      {...props}
    >
      <CategoryIcon
        icon={icon}
        color={color}
        className={cn(
          "size-[38px] rounded-md md:size-[42px] [&_svg]:size-[18px] md:[&_svg]:size-5",
          hidden && "opacity-60",
        )}
      />
      <div className="flex min-w-0 flex-1 flex-col gap-[3px]">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5 md:gap-2">
          <span
            className={cn(
              "truncate text-[15px] leading-5 font-semibold md:text-base",
              hidden ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {name}
          </span>
          {isDefault ? (
            <span className={cn(badgeClassName, "bg-secondary text-muted-foreground")}>Padrão</span>
          ) : null}
          {hidden ? (
            <span
              className={cn(badgeClassName, "hidden bg-warning-soft text-warning-ink md:inline")}
            >
              Oculta
            </span>
          ) : null}
        </div>
        <p className="text-xs leading-4 text-muted-foreground md:text-[13px]">
          <span className="md:hidden">
            {hidden ? "Oculta · " : null}
            {count} · <span className="financial-value">{total}</span>
          </span>
          <span className="hidden md:inline">{count}</span>
        </p>
      </div>
      <Money
        amount={totalInCents}
        currency={currency}
        aria-hidden
        className="hidden w-[110px] shrink-0 text-right font-semibold md:block"
      />
      <div className="flex shrink-0 items-center gap-1">
        <button
          type="button"
          aria-label="Editar categoria"
          onClick={onEdit}
          className={actionClassName}
        >
          <Pencil aria-hidden />
        </button>
        {isDefault ? (
          <button
            type="button"
            aria-label={hidden ? "Mostrar categoria" : "Ocultar categoria"}
            onClick={onToggleHidden}
            className={actionClassName}
          >
            {hidden ? <Eye aria-hidden /> : <EyeOff aria-hidden />}
          </button>
        ) : (
          <button
            type="button"
            aria-label="Excluir categoria"
            onClick={onDelete}
            className={cn(actionClassName, "text-destructive hover:bg-destructive-soft")}
          >
            <Trash2 aria-hidden />
          </button>
        )}
      </div>
    </div>
  );
}
