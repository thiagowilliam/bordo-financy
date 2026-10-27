import { apiFetch } from "@/lib/api-client";
import { env } from "@/lib/env";

import { authUserSchema, emailSentSchema, signedOutSchema } from "../schemas/auth.schema";
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

/**
 * Google sign-in is a full page navigation, not a fetch: the backend redirects to Google, handles
 * the callback, creates the account on the first access and sets the session cookie.
 */
export const getGoogleSignInUrl = (next?: string) => {
  const query = next ? `?next=${encodeURIComponent(next)}` : "";
  return `${env.apiBaseUrl}/api/auth/google${query}`;
};
