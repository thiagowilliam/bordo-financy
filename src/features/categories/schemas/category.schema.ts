import { z } from "zod";

export const categoryIconNameSchema = z.enum([
  "utensils",
  "camera",
  "bus",
  "shopping-bag",
  "fuel",
  "coins",
  "heart-pulse",
  "plane",
  "bed",
  "car",
  "shield-check",
  "wifi",
  "ticket",
  "tag",
  "pill",
  "shirt",
  "baby",
  "dog",
  "music",
  "gift",
  "book-open",
  "dumbbell",
  "scissors",
  "wine",
  "heart",
]);

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Informe o nome da categoria"),
  icon: categoryIconNameSchema,
  /** Index of the `chart-N` token, 1 to 8. */
  color: z.literal([1, 2, 3, 4, 5, 6, 7, 8]),
});

export const createCategorySchema = categorySchema.omit({ id: true });
