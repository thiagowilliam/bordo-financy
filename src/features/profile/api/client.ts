import { ApiError, apiFetch } from "@/lib/api-client";
import { env } from "@/lib/env";

import {
  deletedProfileSchema,
  emailSentSchema,
  profileSchema,
  profileStatsSchema,
} from "../schemas/profile.schema";
import type { UpdateProfileInput } from "../types";

export const fetchProfile = () => apiFetch("/api/profile", profileSchema);

export const fetchProfileStats = () => apiFetch("/api/profile/stats", profileStatsSchema);

export const updateProfile = (input: UpdateProfileInput) =>
  apiFetch("/api/profile", profileSchema, { method: "PATCH", body: input });

export function uploadProfilePhoto(photo: File) {
  const body = new FormData();
  body.append("photo", photo);
  return apiFetch("/api/profile/photo", profileSchema, { method: "PUT", body });
}

export const removeProfilePhoto = () =>
  apiFetch("/api/profile/photo", profileSchema, { method: "DELETE" });

export const requestEmailChange = (email: string) =>
  apiFetch("/api/profile/email-change", emailSentSchema, { method: "POST", body: { email } });

export const requestPasswordReset = () =>
  apiFetch("/api/profile/password-reset", emailSentSchema, { method: "POST" });

export const deleteProfile = () =>
  apiFetch("/api/profile", deletedProfileSchema, { method: "DELETE" });

/** The export is a CSV file, not JSON: it is read as a Blob instead of going through a schema. */
export async function fetchExpensesExport(): Promise<Blob> {
  const response = await fetch(`${env.apiBaseUrl}/api/profile/export`);
  if (!response.ok) throw new ApiError(response.status, response.statusText);
  return response.blob();
}
