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
  "coffee",
  "landmark",
  "file-text",
  "ellipsis",
]);

/** Which kind of expense a category classifies: day to day spending or base costs. */
export const categoryKindSchema = z.enum(["DAILY", "BASE"]);

export const categoryColorSchema = z.literal([1, 2, 3, 4, 5, 6, 7, 8]);

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Informe o nome da categoria"),
  icon: categoryIconNameSchema,
  /** Index of the `chart-N` token, 1 to 8. */
  color: categoryColorSchema,
  kind: categoryKindSchema,
  /** Default categories can be hidden but never deleted. */
  isDefault: z.boolean(),
  /** Hidden categories are not offered for new expenses; existing ones keep them. */
  hidden: z.boolean(),
});

export const createCategorySchema = categorySchema.omit({
  id: true,
  isDefault: true,
  hidden: true,
});

export const updateCategorySchema = categorySchema.pick({ name: true, icon: true, color: true });

export const setCategoryHiddenSchema = categorySchema.pick({ hidden: true });

export const deletedCategorySchema = z.object({
  id: z.string(),
  /** How many expenses were moved to another category. */
  movedExpenses: z.number().int().nonnegative(),
});
