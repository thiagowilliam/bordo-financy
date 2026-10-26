import { http, HttpResponse } from "msw/http";

import {
  createCategorySchema,
  setCategoryHiddenSchema,
  updateCategorySchema,
} from "@/features/categories";

import { db } from "./db";

const findCategory = (id: unknown) => db.categories.find((category) => category.id === id);

export const categoryHandlers = [
  http.get("/api/categories", () => HttpResponse.json(db.categories)),

  http.post("/api/categories", async ({ request }) => {
    const input = createCategorySchema.parse(await request.json());
    const category = {
      ...input,
      id: `cat-${crypto.randomUUID()}`,
      isDefault: false,
      hidden: false,
    };
    db.categories.push(category);
    return HttpResponse.json(category, { status: 201 });
  }),

  http.put("/api/categories/:id", async ({ params, request }) => {
    const category = findCategory(params.id);
    if (!category) return new HttpResponse(null, { status: 404 });
    Object.assign(category, updateCategorySchema.parse(await request.json()));
    return HttpResponse.json(category);
  }),

  http.put("/api/categories/:id/hidden", async ({ params, request }) => {
    const category = findCategory(params.id);
    if (!category) return new HttpResponse(null, { status: 404 });
    category.hidden = setCategoryHiddenSchema.parse(await request.json()).hidden;
    return HttpResponse.json(category);
  }),

  http.delete("/api/categories/:id", ({ params, request }) => {
    const category = findCategory(params.id);
    if (!category) return new HttpResponse(null, { status: 404 });
    // Default categories can only be hidden.
    if (category.isDefault) return new HttpResponse(null, { status: 409 });

    const used = db.expenses.filter((expense) => expense.categoryId === category.id);
    const moveTo = new URL(request.url).searchParams.get("moveTo");
    if (used.length > 0) {
      const target = moveTo ? findCategory(moveTo) : undefined;
      if (!target || target.id === category.id || target.kind !== category.kind) {
        return new HttpResponse(null, { status: 422 });
      }
      for (const expense of used) expense.categoryId = target.id;
    }
    db.categories.splice(db.categories.indexOf(category), 1);
    return HttpResponse.json({ id: category.id, movedExpenses: used.length });
  }),
];
