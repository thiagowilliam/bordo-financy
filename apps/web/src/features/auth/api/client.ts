import { apiFetch } from "@/lib/api-client";
import { env } from "@/lib/env";

import {
  authUserSchema,
  emailChangedSchema,
  emailChangeTokenSchema,
  emailSentSchema,
  googleRedirectSchema,
  resetTokenSchema,
  signedOutSchema,
} from "@bordo/shared/auth";
import type { ForgotPasswordInput, SignInInput, SignUpInput } from "../types";

/** The backend sets the httpOnly session cookie on these two. Passwords never touch client state. */
export const signIn = ({ email, password }: SignInInput) =>
  apiFetch("/api/auth/sign-in", authUserSchema, { method: "POST", body: { email, password } });

export const signUp = ({ email, password }: Pick<SignUpInput, "email" | "password">) =>
  apiFetch("/api/auth/sign-up", authUserSchema, { method: "POST", body: { email, password } });

export const signOut = () => apiFetch("/api/auth/sign-out", signedOutSchema, { method: "POST" });

/** Answers 401 without a valid session. */
export const fetchSession = () => apiFetch("/api/auth/session", authUserSchema);

/** Always answers the same, so the form cannot be used to find out which e-mails have an account. */
export const requestPasswordRecovery = ({ email }: ForgotPasswordInput) =>
  apiFetch("/api/auth/forgot-password", emailSentSchema, { method: "POST", body: { email } });

/** Answers `410` when the link expired or was already used. */
export const fetchResetToken = (token: string) =>
  apiFetch(`/api/auth/reset-password/${encodeURIComponent(token)}`, resetTokenSchema);

/** Also ends the account's other sessions. */
export const resetPassword = (input: { token: string; password: string }) =>
  apiFetch("/api/auth/reset-password", signedOutSchema, { method: "POST", body: input });

/** Answers `410` when the link expired or was already used. Reading it does not consume the link. */
export const fetchEmailChangeToken = (token: string) =>
  apiFetch(`/api/auth/email-change/${encodeURIComponent(token)}`, emailChangeTokenSchema);

/** Answers `410` (expired or used) or `409` (address now taken). Ends every session of the account. */
export const confirmEmailChange = (token: string) =>
  apiFetch("/api/auth/email-change/confirm", emailChangedSchema, {
    method: "POST",
    body: { token },
  });

type GoogleUrlOptions = {
  next?: string;
  /** Connect Google to the signed-in account instead of signing in with it. */
  link?: boolean;
};

/**
 * Google sign-in is a full page navigation, not a fetch: the backend redirects to Google, handles
 * the callback, creates the account on the first access (or links it to the account with the same
 * verified e-mail) and sets the session cookie. Failures come back to `/entrar?error=...`.
 */
export function getGoogleUrl({ next, link }: GoogleUrlOptions = {}) {
  const params = new URLSearchParams();
  if (next) params.set("next", next);
  if (link) params.set("link", "1");
  const query = params.size > 0 ? `?${params}` : "";
  return `${env.apiBaseUrl}/api/auth/google${query}`;
}

/** Mocks only: MSW cannot answer a navigation, so the redirect is read from a fetch instead. */
export const fetchMockGoogleRedirect = (options: GoogleUrlOptions) =>
  apiFetch(getGoogleUrl(options), googleRedirectSchema);
