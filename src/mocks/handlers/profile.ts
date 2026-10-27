import { http, HttpResponse } from "msw/http";

import { changeEmailSchema, updateProfileSchema } from "@/features/profile";

import { db } from "./db";

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

function buildExpensesCsv() {
  const header = ["Viagem", "Data", "Tipo", "Descrição", "Valor", "Moeda"];
  const rows = db.expenses.map((expense) => [
    db.trips.find((trip) => trip.id === expense.tripId)?.name ?? "",
    expense.date,
    expense.kind === "BASE" ? "Custo de base" : "Dia a dia",
    expense.description,
    (expense.amountInCents / 100).toFixed(2),
    expense.currency,
  ]);
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

export const profileHandlers = [
  http.get("/api/profile", () => HttpResponse.json(db.profile)),

  http.get("/api/profile/stats", () => HttpResponse.json(db.profileStats)),

  http.patch("/api/profile", async ({ request }) => {
    const input = updateProfileSchema.safeParse(await request.json());
    if (!input.success) return new HttpResponse(null, { status: 422 });
    db.profile = { ...db.profile, ...input.data };
    return HttpResponse.json(db.profile);
  }),

  http.put("/api/profile/photo", async ({ request }) => {
    const photo = (await request.formData()).get("photo");
    if (photo === null || typeof photo === "string" || photo.size > MAX_PHOTO_SIZE) {
      return new HttpResponse(null, { status: 422 });
    }
    // The browser keeps the file alive for this URL; there is no storage behind the mock.
    db.profile.photoUrl =
      typeof URL.createObjectURL === "function"
        ? URL.createObjectURL(photo)
        : `blob:mock/${photo.name}`;
    return HttpResponse.json(db.profile);
  }),

  http.delete("/api/profile/photo", () => {
    db.profile.photoUrl = null;
    return HttpResponse.json(db.profile);
  }),

  http.post("/api/profile/email-change", async ({ request }) => {
    const input = changeEmailSchema.safeParse(await request.json());
    if (!input.success) return new HttpResponse(null, { status: 422 });
    // Still the old address until the link is confirmed, like the real flow.
    return HttpResponse.json({ email: input.data.email });
  }),

  http.post("/api/profile/password-reset", () => {
    if (db.profile.authProvider !== "PASSWORD") return new HttpResponse(null, { status: 409 });
    return HttpResponse.json({ email: db.profile.email });
  }),

  http.get(
    "/api/profile/export",
    () =>
      new HttpResponse(buildExpensesCsv(), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": 'attachment; filename="bordo-gastos.csv"',
        },
      }),
  ),

  http.delete("/api/profile", () => HttpResponse.json({ id: db.profile.id })),
];
