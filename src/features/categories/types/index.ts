import type { z } from "zod";

import type { categorySchema, createCategorySchema } from "../schemas/category.schema";

export type Category = z.infer<typeof categorySchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
