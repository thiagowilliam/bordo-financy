import type { z } from "zod";

import type { profileSchema, profileStatsSchema, updateProfileSchema } from "@bordo/shared/profile";

export type Profile = z.infer<typeof profileSchema>;
export type ProfileStats = z.infer<typeof profileStatsSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
