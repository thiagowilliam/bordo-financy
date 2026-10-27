import { delay, http, HttpResponse } from "msw";

import { forgotPasswordSchema, newPasswordSchema, signInSchema } from "@/features/auth";
import { safeRedirectPath } from "@/lib/auth-routes";

import { db } from "./db";

/** Typing this password makes the mocked sign-in fail, to exercise the error state. */
export const MOCK_WRONG_PASSWORD = "senha-incorreta";

/** A recovery link with this token is expired, to exercise that state. */
export const MOCK_EXPIRED_TOKEN = "expirado";

export const MOCK_GOOGLE_EMAIL = "marina@gmail.com";

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

  http.get("/api/auth/reset-password/:token", ({ params }) =>
    params.token === MOCK_EXPIRED_TOKEN
      ? new HttpResponse(null, { status: 410 })
      : HttpResponse.json({ email: db.profile.email }),
  ),

  http.post("/api/auth/reset-password", async ({ request }) => {
    const body = (await request.json()) as { token?: string; password?: string };
    if (body.token === MOCK_EXPIRED_TOKEN) return new HttpResponse(null, { status: 410 });
    const password = newPasswordSchema.safeParse({
      password: body.password,
      confirmPassword: body.password,
    });
    if (!password.success) return new HttpResponse(null, { status: 422 });
    return HttpResponse.json({});
  }),

  // The real endpoint answers a 302 to Google. A navigation cannot be mocked, so while mocking the
  // client reads the destination from this JSON instead, and the Google account is "connected".
  http.get("/api/auth/google", async ({ request }) => {
    await delay(600);
    const url = new URL(request.url);
    db.profile.googleEmail ??= MOCK_GOOGLE_EMAIL;
    return HttpResponse.json({
      redirectTo: url.searchParams.has("link")
        ? safeRedirectPath(url.searchParams.get("next") ?? "/perfil")
        : safeRedirectPath(url.searchParams.get("next")),
    });
  }),
];
