import type { Profile, ProfileStats } from "@/features/profile";

/** Like the Pencil design: Marina, who can sign in with e-mail and password or with Google. */
export const profileFixture: Profile = {
  id: "user-marina",
  name: "Marina Duarte",
  email: "marina@email.com",
  emailVerified: true,
  photoUrl: null,
  currency: "BRL",
  hasPassword: true,
  googleEmail: "marina@gmail.com",
  createdAt: "2026-03-14",
};

/** Fixed numbers from the design: the mock trips do not add up to a full traveler history. */
export const profileStatsFixture: ProfileStats = {
  trips: 8,
  daysTraveled: 64,
  destinations: 6,
  totalInCents: 4823000,
};
