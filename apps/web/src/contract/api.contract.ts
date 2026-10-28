import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { fetchSession, signIn, signOut, signUp } from "@/features/auth/api/client";
import {
  createCategory,
  deleteCategory,
  fetchCategories,
  setCategoryHidden,
  updateCategory,
} from "@/features/categories/api/client";
import { fetchBaseCosts } from "@/features/base-costs/api/client";
import {
  createExpense,
  deleteExpense,
  fetchExpenses,
  updateExpense,
} from "@/features/expenses/api/client";
import {
  deletePhoto,
  fetchPhotos,
  setCoverPhoto,
  uploadPhotos,
} from "@/features/photos/api/client";
import {
  deleteProfile,
  fetchExpensesExport,
  fetchProfile,
  fetchProfileStats,
  removeProfilePhoto,
  requestPasswordReset,
  updateProfile,
  uploadProfilePhoto,
} from "@/features/profile/api/client";
import { createTrip, fetchTrip, fetchTrips } from "@/features/trips/api/client";
import { ApiError } from "@/lib/api-client";
import { env } from "@/lib/env";

/** A valid 1x1 PNG. */
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);
const pngFile = (name: string) => new File([PNG], name, { type: "image/png" });

const PASSWORD = "Senha-forte-1";
const email = `contract-${Date.now()}@email.com`;

const status = async (promise: Promise<unknown>) => {
  try {
    await promise;
    return 200;
  } catch (error) {
    if (error instanceof ApiError) return error.status;
    throw error;
  }
};

/** Node's fetch has no cookie jar: keep the session cookie like a browser would. */
const realFetch = globalThis.fetch;
const jar = new Map<string, string>();
function installCookieJar() {
  globalThis.fetch = async (input, init) => {
    const headers = new Headers(init?.headers);
    if (jar.size > 0) headers.set("cookie", [...jar].map(([k, v]) => `${k}=${v}`).join("; "));
    const response = await realFetch(input, { ...init, headers, redirect: "manual" });
    for (const line of response.headers.getSetCookie()) {
      const [pair] = line.split(";");
      const [name, ...value] = pair.split("=");
      if (value.join("") === "" || /max-age=0/i.test(line)) jar.delete(name);
      else jar.set(name, value.join("="));
    }
    return response;
  };
}

// Shared across the ordered steps below.
const state = {} as {
  tripId: string;
  food: string;
  base: string;
  custom: string;
  expenseId: string;
  photoIds: string[];
};

describe("web API client against the real API", () => {
  beforeAll(installCookieJar);
  afterAll(() => {
    globalThis.fetch = realFetch;
  });

  it("is pointed at an API", () => {
    expect(env.apiBaseUrl).toMatch(/^http/);
  });

  describe("auth", () => {
    it("signs up, reads the session and refuses the same e-mail again", async () => {
      const user = await signUp({ email, password: PASSWORD });
      expect(user.email).toBe(email);
      expect(await fetchSession()).toEqual(user);
      expect(await status(signUp({ email, password: PASSWORD }))).toBe(409);
    });

    it("signs out (a bodyless POST), then rejects a wrong password and accepts the right one", async () => {
      await signOut();
      expect(await status(fetchSession())).toBe(401);
      expect(await status(signIn({ email, password: "Errada-123" }))).toBe(401);
      expect((await signIn({ email, password: PASSWORD })).email).toBe(email);
    });
  });

  describe("profile", () => {
    it("reads and updates the profile and starts with empty stats", async () => {
      expect((await fetchProfile()).email).toBe(email);
      const updated = await updateProfile({ name: "Marina Teste", currency: "EUR" });
      expect(updated).toMatchObject({ name: "Marina Teste", currency: "EUR" });
      expect(await fetchProfileStats()).toEqual({
        trips: 0,
        daysTraveled: 0,
        destinations: 0,
        totalInCents: 0,
      });
    });

    it("asks for a password link", async () => {
      expect(await requestPasswordReset()).toEqual({ email });
    });
  });

  describe("categories", () => {
    it("lists the defaults, then creates, edits and hides a custom one", async () => {
      const categories = await fetchCategories();
      expect(categories).toHaveLength(11);
      state.food = categories.find((c) => c.name === "Alimentação")!.id;
      state.base = categories.find((c) => c.name === "Hospedagem")!.id;

      const created = await createCategory({
        name: "Combustível",
        icon: "fuel",
        color: 4,
        kind: "DAILY",
      });
      expect(created).toMatchObject({ isDefault: false, hidden: false });
      state.custom = created.id;
      expect(
        await updateCategory(created.id, { name: "Gasolina", icon: "fuel", color: 5 }),
      ).toMatchObject({
        name: "Gasolina",
      });
      expect((await setCategoryHidden(created.id, true)).hidden).toBe(true);
      expect((await setCategoryHidden(created.id, false)).hidden).toBe(false);
    });
  });

  describe("trips", () => {
    it("creates a trip and finds it in the list and by id", async () => {
      const trip = await createTrip({
        name: "Lisboa & Sintra",
        destination: "Portugal",
        startDate: "2026-10-12",
        endDate: "2026-10-26",
        budgetInCents: 500000,
        currency: "EUR",
      });
      state.tripId = trip.id;
      expect(trip.coverPhotoUrl).toBeNull();
      expect(await fetchTrip(trip.id)).toEqual(trip);
      expect((await fetchTrips())[0]).toMatchObject({ id: trip.id, spentInCents: 0 });
    });
  });

  describe("expenses and base costs", () => {
    it("creates daily and base expenses and lists them with the filters the screen uses", async () => {
      const common = { tripId: state.tripId, currency: "EUR" };
      const daily = await createExpense({
        ...common,
        kind: "DAILY",
        categoryId: state.food,
        paymentMethod: "CASH",
        amountInCents: 1250,
        date: "2026-10-13",
        description: "Pastel de nata",
      });
      state.expenseId = daily.id;
      await createExpense({
        ...common,
        kind: "BASE",
        categoryId: state.base,
        paymentMethod: "INTERNATIONAL_CARD",
        amountInCents: 74000,
        date: "2026-03-02",
        description: "Apartamento em Alfama",
      });

      expect(await fetchExpenses(state.tripId)).toHaveLength(1);
      expect(await fetchExpenses(state.tripId, { search: "pastel" })).toHaveLength(1);
      expect(await fetchExpenses(state.tripId, { search: "zzz" })).toHaveLength(0);
      expect(
        await fetchExpenses(state.tripId, {
          categories: [state.food],
          paymentMethod: "CASH",
          from: "2026-10-01",
          to: "2026-10-31",
        }),
      ).toHaveLength(1);
      expect(await fetchBaseCosts(state.tripId)).toHaveLength(1);
      expect((await fetchTrips())[0].spentInCents).toBe(75250);
    });

    it("edits an expense", async () => {
      const edited = await updateExpense(state.expenseId, {
        tripId: state.tripId,
        currency: "EUR",
        kind: "DAILY",
        categoryId: state.food,
        paymentMethod: "PIX",
        amountInCents: 2000,
        date: "2026-10-14",
        description: "Pastéis",
      });
      expect(edited).toMatchObject({ amountInCents: 2000, paymentMethod: "PIX" });
    });

    it("rejects an expense in another currency", async () => {
      expect(
        await status(
          createExpense({
            tripId: state.tripId,
            currency: "USD",
            kind: "DAILY",
            categoryId: state.food,
            paymentMethod: "CASH",
            amountInCents: 100,
            date: "2026-10-13",
            description: "x",
          }),
        ),
      ).toBe(422);
    });

    it("exports a CSV and reads the stats", async () => {
      const csv = await (await fetchExpensesExport()).text();
      expect(csv).toContain('"Viagem","Data","Tipo","Descrição","Valor","Moeda"');
      expect(csv).toContain("Pastéis");
      expect(await fetchProfileStats()).toMatchObject({
        trips: 1,
        daysTraveled: 15,
        destinations: 1,
      });
    });
  });

  describe("categories in use", () => {
    it("moves the expenses on delete, and refuses defaults and a missing target", async () => {
      await createExpense({
        tripId: state.tripId,
        currency: "EUR",
        kind: "DAILY",
        categoryId: state.custom,
        paymentMethod: "CASH",
        amountInCents: 300,
        date: "2026-10-15",
        description: "Gasolina",
      });
      expect(await status(deleteCategory(state.custom))).toBe(422);
      expect(await status(deleteCategory(state.food))).toBe(409);
      expect(await deleteCategory(state.custom, state.food)).toEqual({
        id: state.custom,
        movedExpenses: 1,
      });
    });

    it("deletes an expense", async () => {
      expect(await deleteExpense(state.tripId, state.expenseId)).toEqual({ id: state.expenseId });
    });
  });

  describe("photos", () => {
    it("uploads, lists with the cover first, changes the cover and deletes", async () => {
      const created = await uploadPhotos(state.tripId, [pngFile("a.png"), pngFile("b.png")]);
      expect(created).toHaveLength(2);
      state.photoIds = created.map((photo) => photo.id);
      expect(created[0].isCover).toBe(true);

      const image = await realFetch(`${env.apiBaseUrl}${created[0].url}`);
      expect(image.status).toBe(200);
      expect(image.headers.get("content-type")).toBe("image/png");

      expect((await fetchTrips())[0].coverPhotoUrl).toBe(created[0].url);
      await setCoverPhoto(state.tripId, state.photoIds[1]);
      expect((await fetchPhotos(state.tripId))[0].id).toBe(state.photoIds[1]);
      expect(await deletePhoto(state.tripId, state.photoIds[1])).toEqual({ id: state.photoIds[1] });
      expect((await fetchPhotos(state.tripId)).map((photo) => photo.id)).toEqual([
        state.photoIds[0],
      ]);
    });

    it("sets and removes the profile photo", async () => {
      const profile = await uploadProfilePhoto(pngFile("eu.png"));
      expect(profile.photoUrl).toMatch(/^\/api\/media\/avatars\//);
      expect((await removeProfilePhoto()).photoUrl).toBeNull();
    });
  });

  describe("account", () => {
    it("deletes the account and the session stops working", async () => {
      expect((await deleteProfile()).id).toBeTruthy();
      expect(await status(fetchSession())).toBe(401);
    });
  });
});
