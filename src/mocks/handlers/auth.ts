import { http, HttpResponse } from "msw/http";

import { forgotPasswordSchema, signInSchema } from "@/features/auth";

import { db } from "./db";

/** Typing this password makes the mocked sign-in fail, to exercise the error state. */
export const MOCK_WRONG_PASSWORD = "senha-incorreta";

const bodySchema = signInSchema;

/**
 * There is no session in the mocks: MSW cannot set the httpOnly cookie the real backend sets,
 * and `proxy.ts` skips the auth guard while mocking.
 */
export const authHandlers = [
  http.post("/api/auth/sign-in", async ({ request }) => {
    const input = signInSchema.safeParse(await request.json());
    if (!input.success) return new HttpResponse(null, { status: 422 });
    if (input.data.password === MOCK_WRONG_PASSWORD) return new HttpResponse(null, { status: 401 });
    return HttpResponse.json({ ...db.profile, email: input.data.email });
  }),

  http.post("/api/auth/sign-up", async ({ request }) => {
    const input = bodySchema.safeParse(await request.json());
    if (!input.success) return new HttpResponse(null, { status: 422 });
    if (input.data.email.toLowerCase() === db.profile.email.toLowerCase()) {
      return new HttpResponse(null, { status: 409 });
    }
    return HttpResponse.json({ ...db.profile, email: input.data.email }, { status: 201 });
  }),

  http.post("/api/auth/sign-out", () => HttpResponse.json({})),

  http.get("/api/auth/session", () => HttpResponse.json(db.profile)),

  http.post("/api/auth/forgot-password", async ({ request }) => {
    const input = forgotPasswordSchema.safeParse(await request.json());
    if (!input.success) return new HttpResponse(null, { status: 422 });
    return HttpResponse.json({ email: input.data.email });
  }),
];
