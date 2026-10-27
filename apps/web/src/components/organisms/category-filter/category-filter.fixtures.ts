import type { CategoryFilterOption } from "./category-filter";

/** Lisboa & Sintra categories, shared by the filter stories and tests. */
export const lisbonCategoryOptions: CategoryFilterOption[] = [
  { id: "food", name: "Alimentação", icon: "utensils", color: 1, count: 12 },
  { id: "tours", name: "Passeios", icon: "camera", color: 2, count: 5 },
  { id: "transport", name: "Transporte", icon: "bus", color: 3, count: 5 },
  { id: "shopping", name: "Compras", icon: "shopping-bag", color: 4, count: 3 },
  { id: "fuel", name: "Combustível", icon: "fuel", color: 5, count: 2 },
  { id: "tips", name: "Gorjetas", icon: "coins", color: 6, count: 3 },
  { id: "health", name: "Saúde e outros", icon: "heart-pulse", color: 7, count: 1 },
];
