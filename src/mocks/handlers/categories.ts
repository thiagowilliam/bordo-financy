import { http, HttpResponse } from "msw/http";

import { createCategorySchema } from "@/features/categories";

import { db } from "./db";

export const categoryHandlers = [
  http.get("/api/categories", () => HttpResponse.json(db.categories)),

  http.post("/api/categories", async ({ request }) => {
    const input = createCategorySchema.parse(await request.json());
    const category = { ...input, id: `cat-${crypto.randomUUID()}` };
    db.categories.push(category);
    return HttpResponse.json(category, { status: 201 });
  }),
];
