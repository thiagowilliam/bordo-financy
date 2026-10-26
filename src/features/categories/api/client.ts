import { z } from "zod";

import { apiFetch } from "@/lib/api-client";

import { categorySchema, deletedCategorySchema } from "../schemas/category.schema";
import type { CreateCategoryInput, UpdateCategoryInput } from "../types";

export const fetchCategories = () => apiFetch("/api/categories", z.array(categorySchema));

export const createCategory = (input: CreateCategoryInput) =>
  apiFetch("/api/categories", categorySchema, { method: "POST", body: input });

export const updateCategory = (id: string, input: UpdateCategoryInput) =>
  apiFetch(`/api/categories/${id}`, categorySchema, { method: "PUT", body: input });

export const setCategoryHidden = (id: string, hidden: boolean) =>
  apiFetch(`/api/categories/${id}/hidden`, categorySchema, { method: "PUT", body: { hidden } });

/** `moveTo` is required when expenses use the category: they are moved before it is deleted. */
export const deleteCategory = (id: string, moveTo?: string) =>
  apiFetch(
    `/api/categories/${id}${moveTo ? `?moveTo=${encodeURIComponent(moveTo)}` : ""}`,
    deletedCategorySchema,
    { method: "DELETE" },
  );
