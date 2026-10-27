import type { Category } from "@/features/categories";

const daily = (
  id: string,
  name: string,
  icon: Category["icon"],
  color: Category["color"],
  isDefault: boolean,
): Category => ({
  id: `cat-${id}`,
  name,
  icon,
  color,
  kind: "DAILY",
  isDefault,
  hidden: false,
});

const base = (
  id: string,
  name: string,
  icon: Category["icon"],
  color: Category["color"],
  isDefault: boolean,
): Category => ({ ...daily(id, name, icon, color, isDefault), kind: "BASE" });

export const categoriesFixture: Category[] = [
  daily("alimentacao", "Alimentação", "utensils", 7, true),
  daily("passeios", "Passeios", "camera", 1, true),
  daily("transporte", "Transporte", "bus", 2, true),
  daily("compras", "Compras", "shopping-bag", 3, true),
  daily("combustivel", "Combustível", "fuel", 4, false),
  daily("gorjetas", "Gorjetas", "coins", 5, false),
  daily("saude", "Saúde e outros", "heart-pulse", 6, true),
  base("passagem", "Passagem aérea", "plane", 7, true),
  base("hospedagem", "Hospedagem", "bed", 1, true),
  base("aluguel-carro", "Aluguel de carro", "car", 2, true),
  base("seguro", "Seguro viagem", "shield-check", 3, true),
  base("conectividade", "Conectividade", "wifi", 6, false),
  base("transfer", "Transfer", "bus", 5, false),
  base("ingressos", "Ingressos antecipados", "ticket", 4, false),
  base("documentacao", "Documentação", "file-text", 8, true),
  base("outros", "Outros", "ellipsis", 6, true),
];
