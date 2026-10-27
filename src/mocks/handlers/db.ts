import { categoriesFixture } from "../fixtures/categories";
import { expensesFixture } from "../fixtures/expenses";
import { photosFixture } from "../fixtures/photos";
import { profileFixture, profileStatsFixture } from "../fixtures/profile";
import { tripsFixture } from "../fixtures/trips";

/** In-memory data. Mutations from handlers live until the page reloads. */
export const db = {
  trips: structuredClone(tripsFixture),
  categories: structuredClone(categoriesFixture),
  expenses: structuredClone(expensesFixture),
  photos: structuredClone(photosFixture),
  profile: structuredClone(profileFixture),
  profileStats: structuredClone(profileStatsFixture),
};
