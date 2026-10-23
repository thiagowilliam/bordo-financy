import { categoriesFixture } from "../fixtures/categories";
import { expensesFixture } from "../fixtures/expenses";
import { tripsFixture } from "../fixtures/trips";

/** In-memory data. Mutations from handlers live until the page reloads. */
export const db = {
  trips: structuredClone(tripsFixture),
  categories: structuredClone(categoriesFixture),
  expenses: structuredClone(expensesFixture),
};
