import type { z } from "zod";

import type {
  authProviderSchema,
  profileSchema,
  profileStatsSchema,
  updateProfileSchema,
} from "../schemas/profile.schema";

export type AuthProvider = z.infer<typeof authProviderSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type ProfileStats = z.infer<typeof profileStatsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
