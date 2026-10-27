import type { z } from "zod";

import type {
  categoryKindSchema,
  categorySchema,
  createCategorySchema,
  updateCategorySchema,
} from "@bordo/shared/categories";

export type Category = z.infer<typeof categorySchema>;
export type CategoryKind = z.infer<typeof categoryKindSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
