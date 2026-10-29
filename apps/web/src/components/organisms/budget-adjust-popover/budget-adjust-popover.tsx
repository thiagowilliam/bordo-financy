"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { FilterSurface } from "@/components/molecules/filter-surface";
import { FormField } from "@/components/molecules/form-field";
import { FormNotice } from "@/components/molecules/form-notice";
import { MoneyInput } from "@/components/molecules/money-input";
import { Button } from "@/components/ui/button";
import { formatMoney, type CurrencyCode } from "@/lib/money";

export type BudgetAdjustPopoverProps = {
  /** Current budget, integer in cents. */
  budgetInCents: number;
  /** Amount already spent, integer in cents. */
  spentInCents: number;
  currency: CurrencyCode;
  onSave: (budgetInCents: number) => void;
  isPending?: boolean;
  /** Controlled open state. Uncontrolled when omitted. */
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type FormProps = Pick<
  BudgetAdjustPopoverProps,
  "budgetInCents" | "spentInCents" | "currency" | "onSave" | "isPending"
> & { onCancel: () => void };

/** Mounted only while open, so the draft starts from the current budget on every opening. */
function BudgetForm({
  budgetInCents,
  spentInCents,
  currency,
  onSave,
  isPending = false,
  onCancel,
}: FormProps) {
  const [draft, setDraft] = useState(budgetInCents);
  const belowSpent = draft > 0 && draft < spentInCents;
  const canSave = draft > 0 && draft !== budgetInCents && !isPending;

  return (
    <form
      className="flex flex-col gap-3.5"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSave) onSave(draft);
      }}
    >
      <FormField
        label="Orçamento total"
        hint={`Você já gastou ${formatMoney(spentInCents, currency)}`}
      >
        {(control) => (
          <MoneyInput
            {...control}
            value={draft}
            currency={currency}
            onValueChange={setDraft}
            disabled={isPending}
          />
        )}
      </FormField>
      {belowSpent ? (
        <FormNotice tone="warning" compact>
          O orçamento ficará abaixo do que já foi gasto.
        </FormNotice>
      ) : null}
      <div className="flex gap-2.5">
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={onCancel}
          className="h-auto flex-1 px-4 py-3 font-bold"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="cta"
          disabled={!canSave}
          className="h-auto flex-1 px-4 py-3 font-bold"
        >
          Salvar
        </Button>
      </div>
    </form>
  );
}

/** Pencil trigger that opens a small form to change the trip budget. */
export function BudgetAdjustPopover({
  open: openProp,
  onOpenChange,
  ...formProps
}: BudgetAdjustPopoverProps) {
  const [innerOpen, setInnerOpen] = useState(false);
  const open = openProp ?? innerOpen;

  function setOpen(next: boolean) {
    setInnerOpen(next);
    onOpenChange?.(next);
  }

  return (
    <FilterSurface
      open={open}
      onOpenChange={setOpen}
      title="Ajustar orçamento"
      popoverClassName="w-80 p-4"
      trigger={
        <button
          type="button"
          aria-label="Ajustar orçamento"
          className="flex size-6 items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-secondary hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Pencil aria-hidden className="size-3.5" />
        </button>
      }
    >
      <BudgetForm {...formProps} onCancel={() => setOpen(false)} />
    </FilterSurface>
  );
}
