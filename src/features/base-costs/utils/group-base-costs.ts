import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { Category } from "@/features/categories";

import type { BaseCost } from "../types";

export type BaseCostGroup = {
  categoryId: string;
  name: string;
  icon: Category["icon"];
  color: Category["color"];
  subtotalInCents: number;
  /** Share of the base cost total, one decimal place, e.g. 45.5. */
  sharePercent: number;
  /** Oldest payment first. */
  items: BaseCost[];
};

export type BaseCostsOverview = {
  totalInCents: number;
  itemCount: number;
  groups: BaseCostGroup[];
};

/** Groups base costs by category, biggest group first, with each group's share of the total. */
export function groupBaseCosts(baseCosts: BaseCost[], categories: Category[]): BaseCostsOverview {
  const totalInCents = baseCosts.reduce((sum, cost) => sum + cost.amountInCents, 0);
  const byCategory = Map.groupBy(baseCosts, (cost) => cost.categoryId);
  const groups = categories
    .filter((category) => byCategory.has(category.id))
    .map((category): BaseCostGroup => {
      const items = byCategory.get(category.id)!;
      const subtotalInCents = items.reduce((sum, cost) => sum + cost.amountInCents, 0);
      return {
        categoryId: category.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        subtotalInCents,
        sharePercent:
          totalInCents > 0 ? Math.round((subtotalInCents / totalInCents) * 1000) / 10 : 0,
        items: items.toSorted(
          (a, b) => a.date.localeCompare(b.date) || b.amountInCents - a.amountInCents,
        ),
      };
    })
    .toSorted((a, b) => b.subtotalInCents - a.subtotalInCents);

  return { totalInCents, itemCount: baseCosts.length, groups };
}

/** "Pago em 14 jul". */
export function formatPaidOn(date: string): string {
  return `Pago em ${format(parseISO(date), "dd MMM", { locale: ptBR }).replace(".", "")}`;
}

/** "45,5% do total". */
export function formatShareLabel(sharePercent: number): string {
  return `${sharePercent.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}% do total`;
}
