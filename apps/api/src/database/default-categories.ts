import type { categoryColorSchema, categoryIconNameSchema } from "@bordo/shared/categories";
import type { z } from "zod";

type DefaultCategory = {
  name: string;
  icon: z.infer<typeof categoryIconNameSchema>;
  color: z.infer<typeof categoryColorSchema>;
  kind: "DAILY" | "BASE";
};

/**
 * Categories every account starts with, in the order they are listed. Each user gets their own
 * copy at sign up (see `categories` in the schema). Changing this list only affects new accounts.
 */
export const DEFAULT_CATEGORIES: readonly DefaultCategory[] = [
  { name: "Alimentação", icon: "utensils", color: 7, kind: "DAILY" },
  { name: "Passeios", icon: "camera", color: 1, kind: "DAILY" },
  { name: "Transporte", icon: "bus", color: 2, kind: "DAILY" },
  { name: "Compras", icon: "shopping-bag", color: 3, kind: "DAILY" },
  { name: "Saúde e outros", icon: "heart-pulse", color: 6, kind: "DAILY" },
  { name: "Passagem aérea", icon: "plane", color: 7, kind: "BASE" },
  { name: "Hospedagem", icon: "bed", color: 1, kind: "BASE" },
  { name: "Aluguel de carro", icon: "car", color: 2, kind: "BASE" },
  { name: "Seguro viagem", icon: "shield-check", color: 3, kind: "BASE" },
  { name: "Documentação", icon: "file-text", color: 8, kind: "BASE" },
  { name: "Outros", icon: "ellipsis", color: 6, kind: "BASE" },
];
