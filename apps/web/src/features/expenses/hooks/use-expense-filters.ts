"use client";

import {
  parseAsArrayOf,
  parseAsString,
  parseAsStringLiteral,
  useQueryStates,
  type Values,
} from "nuqs";
import { useCallback, useMemo } from "react";

import { useDebouncedValue } from "@/lib/use-debounced-value";

import { paymentMethodSchema } from "@bordo/shared/expenses";
import type { ExpenseFilters, PaymentMethod } from "../types";
import { resolvePeriod, type ExpensePeriod, type ExpensePeriodPreset } from "../utils/period";

const periodPresets = [
  "today",
  "yesterday",
  "last3",
  "all",
  "custom",
] as const satisfies readonly ExpensePeriodPreset[];

const filterParsers = {
  q: parseAsString.withDefault(""),
  categorias: parseAsArrayOf(parseAsString).withDefault([]),
  periodo: parseAsStringLiteral(periodPresets),
  de: parseAsString,
  ate: parseAsString,
  pagamento: parseAsStringLiteral(paymentMethodSchema.options),
};

type UseExpenseFiltersOptions = {
  today: string;
  trip: { startDate: string; endDate: string };
};

/** "Dia a dia" filters kept in the URL (nuqs), plus the `ExpenseFilters` the API understands. */
export function useExpenseFilters({ today, trip }: UseExpenseFiltersOptions) {
  const [params, setParams] = useQueryStates(filterParsers);
  const debouncedSearch = useDebouncedValue(params.q.trim(), 300);

  const period = useMemo<ExpensePeriod | null>(
    () =>
      params.periodo
        ? { preset: params.periodo, from: params.de ?? undefined, to: params.ate ?? undefined }
        : null,
    [params.periodo, params.de, params.ate],
  );

  const apiFilters = useMemo<ExpenseFilters>(() => {
    const { from, to } = resolvePeriod(period, { today, trip });
    return {
      search: debouncedSearch || undefined,
      categories: params.categorias.length > 0 ? params.categorias : undefined,
      from,
      to,
      paymentMethod: params.pagamento ?? undefined,
    };
  }, [debouncedSearch, params.categorias, params.pagamento, period, today, trip]);

  const setSearch = useCallback((q: string) => setParams({ q: q || null }), [setParams]);
  const setCategories = useCallback(
    (ids: string[]) => setParams({ categorias: ids.length > 0 ? ids : null }),
    [setParams],
  );
  const setPeriod = useCallback(
    (value: ExpensePeriod | null) =>
      setParams({
        periodo: value?.preset ?? null,
        de: value?.preset === "custom" ? (value.from ?? null) : null,
        ate: value?.preset === "custom" ? (value.to ?? null) : null,
      }),
    [setParams],
  );
  const setPaymentMethod = useCallback(
    (method: PaymentMethod | undefined) => setParams({ pagamento: method ?? null }),
    [setParams],
  );
  const clear = useCallback(
    () =>
      setParams({ q: null, categorias: null, periodo: null, de: null, ate: null, pagamento: null }),
    [setParams],
  );

  const hasActiveFilters =
    params.q.trim() !== "" ||
    params.categorias.length > 0 ||
    params.periodo !== null ||
    params.pagamento !== null;

  return {
    search: params.q,
    categories: params.categorias,
    period,
    paymentMethod: params.pagamento ?? undefined,
    apiFilters,
    hasActiveFilters,
    setSearch,
    setCategories,
    setPeriod,
    setPaymentMethod,
    clear,
  };
}

export type ExpenseFiltersState = Values<typeof filterParsers>;
