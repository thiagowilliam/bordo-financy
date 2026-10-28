import "../config/load-env.js";

import { randomUUID } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { categorySchema } from "@bordo/shared/categories";
import { expenseSchema } from "@bordo/shared/expenses";
import { tripSchema } from "@bordo/shared/trips";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { z } from "zod";

import * as schema from "./schema/index.js";

/**
 * Development seed built from the MSW fixtures of the web app, so the API starts with the same
 * data the screens were designed against. It empties the tables first and refuses to run in production.
 *
 * The fixtures are loaded at runtime and parsed with the shared schemas: the API does not take
 * a compile time dependency on `apps/web`.
 */
if (process.env.NODE_ENV === "production") {
  console.error("Refusing to seed a production database");
  process.exit(1);
}
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is required to seed");
  process.exit(1);
}

const fixturesDir = resolve(import.meta.dirname, "../../../web/src/mocks/fixtures");
const load = async (name: string): Promise<Record<string, unknown>> =>
  import(pathToFileURL(resolve(fixturesDir, `${name}.ts`)).href);

const photoFixtureSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  name: z.string(),
  url: z.string(),
});

const [categoriesModule, tripsModule, expensesModule, photosModule, profileModule] =
  await Promise.all(["categories", "trips", "expenses", "photos", "profile"].map(load));

const categories = categorySchema.array().parse(categoriesModule.categoriesFixture);
const trips = tripSchema.array().parse(tripsModule.tripsFixture);
const expenses = expenseSchema.array().parse(expensesModule.expensesFixture);
const photos = photoFixtureSchema.array().parse(photosModule.photosFixture);
const profile = z
  .object({ name: z.string(), email: z.string(), currency: z.string().length(3) })
  .parse(profileModule.profileFixture);

// Fixture ids are readable strings; the database wants uuids. One stable map per run.
const ids = new Map<string, string>();
const uuidFor = (fixtureId: string) => {
  let id = ids.get(fixtureId);
  if (!id) ids.set(fixtureId, (id = randomUUID()));
  return id;
};

const client = postgres(url, { max: 1 });
const db = drizzle(client, { schema, casing: "snake_case" });

try {
  await db.transaction(async (tx) => {
    await tx.execute(sql`truncate table users, categories, trips, expenses, photos cascade`);

    const [user] = await tx
      .insert(schema.users)
      .values({
        email: profile.email,
        name: profile.name,
        currency: profile.currency,
        emailVerifiedAt: new Date(),
        // No password: sign in through the reset flow or Google once phase 4 exists.
      })
      .returning({ id: schema.users.id });

    await tx.insert(schema.categories).values(
      categories.map((category) => ({
        id: uuidFor(category.id),
        // Default categories are shared (no owner). The others belong to the seeded user.
        userId: category.isDefault ? null : user.id,
        name: category.name,
        icon: category.icon,
        color: category.color,
        kind: category.kind,
      })),
    );

    await tx.insert(schema.trips).values(
      trips.map((trip) => ({
        id: uuidFor(trip.id),
        userId: user.id,
        name: trip.name,
        destination: trip.destination,
        startDate: trip.startDate,
        endDate: trip.endDate,
        currency: trip.currency,
        budgetCents: trip.budgetInCents,
      })),
    );

    await tx.insert(schema.photos).values(
      photos.map((photo) => ({
        id: uuidFor(photo.id),
        tripId: uuidFor(photo.tripId),
        name: photo.name,
        // The fixtures hold absolute URLs; real uploads will hold object storage keys.
        storageKey: photo.url,
      })),
    );

    for (const trip of trips) {
      await tx
        .update(schema.trips)
        .set({ coverPhotoId: uuidFor(`photo-${trip.id}-cover`) })
        .where(eq(schema.trips.id, uuidFor(trip.id)));
    }

    await tx.insert(schema.expenses).values(
      expenses.map((expense) => ({
        id: uuidFor(expense.id),
        tripId: uuidFor(expense.tripId),
        kind: expense.kind,
        categoryId: uuidFor(expense.categoryId),
        paymentMethod: expense.paymentMethod,
        amountCents: expense.amountInCents,
        currency: expense.currency,
        spentAt: expense.date,
        description: expense.description,
      })),
    );
  });
  console.log(
    `Seeded ${categories.length} categories, ${trips.length} trips, ${photos.length} photos, ${expenses.length} expenses`,
  );
} finally {
  await client.end();
}
