import { z } from "zod";

import { apiFetch } from "@/lib/api-client";

import { categorySchema } from "../schemas/category.schema";
import type { CreateCategoryInput } from "../types";

export const fetchCategories = () => apiFetch("/api/categories", z.array(categorySchema));

export const createCategory = (input: CreateCategoryInput) =>
  apiFetch("/api/categories", categorySchema, { method: "POST", body: input });
