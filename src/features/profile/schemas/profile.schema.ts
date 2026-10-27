import { z } from "zod";

import { SUPPORTED_CURRENCY_CODES } from "@/lib/currencies";

export const authProviderSchema = z.enum(["PASSWORD", "GOOGLE"]);

export const profileSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  photoUrl: z.string().nullable(),
  /** Main currency, used to sum trips that were made in different currencies. */
  currency: z.enum(SUPPORTED_CURRENCY_CODES),
  authProvider: authProviderSchema,
  createdAt: z.iso.date(),
});

/** Traveler history. The total is an integer in cents of the profile's main currency. */
export const profileStatsSchema = z.object({
  trips: z.number().int().nonnegative(),
  daysTraveled: z.number().int().nonnegative(),
  destinations: z.number().int().nonnegative(),
  totalInCents: z.number().int().nonnegative(),
});

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1, "Informe seu nome").max(80, "Use até 80 caracteres"),
  currency: z.enum(SUPPORTED_CURRENCY_CODES, "Selecione a moeda"),
});

export const changeEmailSchema = z.object({ email: z.email("E-mail inválido") });

/** Answer of the endpoints that send a link by e-mail. */
export const emailSentSchema = z.object({ email: z.string() });

export const deletedProfileSchema = z.object({ id: z.string() });
