"use client";

import { Info, Trash2 } from "lucide-react";
import { useRef, useState } from "react";

import { CategoryIcon, type CategoryIconName } from "@/components/atoms/category-icon";
import { categoryIcons } from "@/components/atoms/category-icon/category-icon";
import { FilterSurface } from "@/components/molecules/filter-surface";
import { PickerField } from "@/components/molecules/picker-field";
import { ResponsiveModal } from "@/components/organisms/responsive-modal";
import { Button } from "@/components/ui/button";
import { DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatMoney, type CurrencyCode } from "@/lib/money";
import { cn } from "@/lib/utils";

export type DeleteCategoryTarget = {
  id: string;
  name: string;
  icon: CategoryIconName;
  color: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
};

export type DeleteCategoryDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  usageCount: number;
  /** Integer amount in cents of the expenses that use the category. */
  totalInCents: number;
  currency: CurrencyCode;
  /** Other categories the expenses can move to. */
  targets: DeleteCategoryTarget[];
  /** Receives the target category id when there are expenses to move. */
  onConfirm: (moveToId?: string) => void;
  isPending?: boolean;
};

const targetTextColor: Record<DeleteCategoryTarget["color"], string> = {
  1: "text-chart-1",
  2: "text-chart-2",
  3: "text-chart-3",
  4: "text-chart-4",
  5: "text-chart-5",
  6: "text-chart-6",
  7: "text-chart-7",
  8: "text-chart-8",
};

/** Bare decorative icon in the category color. The field label gives the accessible name. */
function TargetIcon({ icon, color }: Pick<DeleteCategoryTarget, "icon" | "color">) {
  const Icon = categoryIcons[icon];
  return <Icon aria-hidden className={cn("size-[18px]", targetTextColor[color])} />;
}

type DeleteContentProps = Omit<DeleteCategoryDialogProps, "open" | "onOpenChange"> & {
  onCancel: () => void;
  cancelRef: React.RefObject<HTMLButtonElement | null>;
};

function DeleteContent({
  name,
  usageCount,
  totalInCents,
  currency,
  targets,
  onConfirm,
  isPending = false,
  onCancel,
  cancelRef,
}: DeleteContentProps) {
  const [chosenId, setChosenId] = useState<string>();
  const [pickerOpen, setPickerOpen] = useState(false);
  const hasUsage = usageCount > 0;
  const target = targets.find((item) => item.id === chosenId) ?? targets[0];
  const noTargets = hasUsage && !target;

  const countLabel = `${usageCount} ${usageCount === 1 ? "lançamento" : "lançamentos"}`;
  const body = hasUsage
    ? `${countLabel} (${formatMoney(totalInCents, currency)}) ${usageCount === 1 ? "usa" : "usam"} esta categoria. Escolha para qual categoria movê-los antes de confirmar.`
    : "Esta categoria não tem lançamentos. Esta ação não pode ser desfeita.";

  return (
    <div className="flex flex-col gap-4">
      <span
        aria-hidden
        className="flex size-12 items-center justify-center rounded-full bg-destructive-soft text-destructive-ink"
      >
        <Trash2 className="size-[22px]" />
      </span>
      <div className="flex flex-col gap-2">
        <DialogTitle className="text-[21px] leading-tight font-bold tracking-[-0.3px] text-foreground md:text-[22px]">
          {`Excluir “${name}”?`}
        </DialogTitle>
        <DialogDescription className="text-[15px] leading-normal text-muted-foreground">
          {body}
        </DialogDescription>
      </div>

      {hasUsage ? (
        <>
          {target ? (
            <FilterSurface
              open={pickerOpen}
              onOpenChange={setPickerOpen}
              title="Mover lançamentos para"
              popoverClassName="w-[var(--radix-popover-trigger-width)] min-w-64 p-2"
              trigger={
                <PickerField
                  label="Mover lançamentos para"
                  valueLabel={target.name}
                  disabled={isPending}
                  aria-haspopup="listbox"
                  aria-expanded={pickerOpen}
                  className="border-[1.5px] border-primary px-4 py-[15px]"
                  icon={<TargetIcon icon={target.icon} color={target.color} />}
                />
              }
            >
              <ul
                role="listbox"
                aria-label="Mover lançamentos para"
                className="flex flex-col gap-0.5"
              >
                {targets.map((item) => {
                  const selected = item.id === target.id;
                  return (
                    <li key={item.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          setChosenId(item.id);
                          setPickerOpen(false);
                        }}
                        className={cn(
                          "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-ring/50",
                          selected && "bg-primary-soft",
                        )}
                      >
                        <CategoryIcon
                          icon={item.icon}
                          color={item.color}
                          className="size-[30px] rounded-md [&_svg]:size-4"
                        />
                        <span
                          className={cn(
                            "min-w-0 flex-1 truncate text-foreground",
                            selected ? "font-bold" : "font-medium",
                          )}
                        >
                          {item.name}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </FilterSurface>
          ) : (
            <p role="status" className="text-sm text-muted-foreground">
              Nenhuma outra categoria disponível
            </p>
          )}
          <p className="flex items-start gap-2 rounded-md bg-warning-soft px-3.5 py-3 text-[13px] leading-[1.45] font-medium text-warning-ink">
            <Info aria-hidden className="mt-px size-4 shrink-0" />
            <span>
              Os lançamentos mantêm data, valor e forma de pagamento. Só a categoria muda. Esta ação
              não pode ser desfeita.
            </span>
          </p>
        </>
      ) : null}

      <div className="flex flex-col-reverse gap-2 pt-1 md:flex-row md:justify-end md:gap-3">
        <Button
          ref={cancelRef}
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onCancel}
          className="h-auto gap-2 border border-border bg-card px-6 py-3.5 text-base font-bold [&_svg]:size-[18px]"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          disabled={isPending || noTargets}
          onClick={() => onConfirm(hasUsage ? target?.id : undefined)}
          className="h-auto gap-2 bg-destructive px-6 py-3.5 text-base font-bold text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/30 [&_svg]:size-[18px]"
        >
          <Trash2 aria-hidden />
          {isPending ? "Excluindo..." : hasUsage ? "Mover e excluir" : "Excluir"}
        </Button>
      </div>
    </div>
  );
}

/** Confirms deleting a category, asking where to move its expenses when it is in use. */
export function DeleteCategoryDialog({
  open,
  onOpenChange,
  ...contentProps
}: DeleteCategoryDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <ResponsiveModal
      open={open}
      onOpenChange={onOpenChange}
      locked={contentProps.isPending}
      mobileVariant="center"
      desktopClassName="max-w-[480px]"
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        cancelRef.current?.focus();
      }}
    >
      <DeleteContent {...contentProps} cancelRef={cancelRef} onCancel={() => onOpenChange(false)} />
    </ResponsiveModal>
  );
}
