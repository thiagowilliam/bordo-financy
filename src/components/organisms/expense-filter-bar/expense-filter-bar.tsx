import { RotateCcw } from "lucide-react";

import { Money } from "@/components/atoms/money";
import { FilterChip } from "@/components/molecules/filter-chip";
import { SearchInput } from "@/components/molecules/search-input";
import { CategoryFilter, type CategoryFilterOption } from "@/components/organisms/category-filter";
import { PaymentFilter } from "@/components/organisms/payment-filter";
import {
  PeriodFilter,
  formatPeriodSummary,
  type PeriodFilterValue,
} from "@/components/organisms/period-filter";
import type { PaymentMethod } from "@/features/expenses";
import type { CurrencyCode } from "@/lib/money";
import { paymentMethodLabels } from "@/lib/payment-methods";
import { cn } from "@/lib/utils";

export type ExpenseFilterBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  categoryOptions: CategoryFilterOption[];
  /** Selected category ids. */
  categories: string[];
  onCategoriesChange: (ids: string[]) => void;
  period: PeriodFilterValue;
  onPeriodChange: (value: PeriodFilterValue) => void;
  /** ISO dates (yyyy-MM-dd) of the trip, limiting the period calendar. */
  periodBounds?: { min: string; max: string };
  paymentMethod: PaymentMethod | undefined;
  onPaymentMethodChange: (method: PaymentMethod | undefined) => void;
  /** Summary of the filtered list, shown at the right of the active filters row from md. */
  result?: { count: number; totalInCents: number; currency: CurrencyCode };
  /** Clears every filter (not the search text). */
  onClear: () => void;
  className?: string;
};

export function ExpenseFilterBar({
  search,
  onSearchChange,
  categoryOptions,
  categories,
  onCategoriesChange,
  period,
  onPeriodChange,
  periodBounds,
  paymentMethod,
  onPaymentMethodChange,
  result,
  onClear,
  className,
}: ExpenseFilterBarProps) {
  const categoryNames = categoryOptions
    .filter((option) => categories.includes(option.id))
    .map((option) => option.name);
  const hasActiveFilters = categories.length > 0 || period !== null || paymentMethod !== undefined;
  const triggerClass = "flex-1 md:flex-none";

  return (
    <div className={cn("flex flex-col gap-3.5", className)}>
      <div className="flex flex-col gap-3.5 md:flex-row md:gap-3.5">
        <SearchInput
          value={search}
          onValueChange={onSearchChange}
          placeholder="Buscar por descrição"
          aria-label="Buscar lançamentos"
          className="md:flex-1"
        />
        <div className="flex gap-2 md:gap-3">
          <CategoryFilter
            options={categoryOptions}
            value={categories}
            onValueChange={onCategoriesChange}
            className={triggerClass}
          />
          <PeriodFilter
            value={period}
            onValueChange={onPeriodChange}
            minDate={periodBounds?.min}
            maxDate={periodBounds?.max}
            className={triggerClass}
          />
          <PaymentFilter
            value={paymentMethod}
            onValueChange={onPaymentMethodChange}
            className={triggerClass}
          />
        </div>
      </div>

      {hasActiveFilters ? (
        <div className="flex flex-wrap items-center gap-2 md:gap-2.5">
          {categoryNames.length > 0 ? (
            <FilterChip
              label={`Categoria: ${categoryNames.join(", ")}`}
              compactLabel={
                categoryNames.length > 1
                  ? `${categoryNames[0]} +${categoryNames.length - 1}`
                  : categoryNames[0]
              }
              onRemove={() => onCategoriesChange([])}
            />
          ) : null}
          {period ? (
            <FilterChip
              label={`Período: ${formatPeriodSummary(period)}`}
              onRemove={() => onPeriodChange(null)}
            />
          ) : null}
          {paymentMethod ? (
            <FilterChip
              label={`Pagamento: ${paymentMethodLabels[paymentMethod]}`}
              onRemove={() => onPaymentMethodChange(undefined)}
            />
          ) : null}
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-[13px] font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 max-md:ml-auto"
          >
            <RotateCcw aria-hidden className="hidden size-3.5 md:block" />
            Limpar filtros
          </button>
          {result ? (
            <p className="ml-auto hidden items-center gap-2 text-sm md:flex">
              <span className="font-semibold text-muted-foreground">
                {result.count} {result.count === 1 ? "lançamento" : "lançamentos"}
              </span>
              <span aria-hidden className="text-subtle-foreground">
                ·
              </span>
              <Money
                amount={result.totalInCents}
                currency={result.currency}
                size="sm"
                tone="primary"
                className="font-bold"
              />
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
