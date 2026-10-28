import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  confirmEmailChange,
  fetchEmailChangeToken,
  fetchResetToken,
  fetchSession,
  requestPasswordRecovery,
  resetPassword,
  signIn,
  signOut,
  signUp,
} from "@/features/auth/api/client";
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
  requestEmailChange,
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
const newEmail = `new-${Date.now()}@email.com`;
const NEW_PASSWORD = "Outra-senha-9!";

/** Mailpit, the development inbox (`docker compose up -d mailpit`, the API pointed at it). */
const MAILPIT = process.env.CONTRACT_MAILPIT_URL ?? "http://localhost:8025";
const mailpitUp = await fetch(`${MAILPIT}/api/v1/info`, { signal: AbortSignal.timeout(1500) })
  .then((response) => response.ok)
  .catch(() => false);

type Inbox = { ID: string; Subject: string; Text: string; HTML: string };

const idsFor = async (address: string): Promise<string[]> => {
  const found = (await (
    await fetch(`${MAILPIT}/api/v1/search?query=to:${encodeURIComponent(address)}`)
  ).json()) as { messages?: { ID: string }[] };
  return (found.messages ?? []).map((message) => message.ID);
};

/** The ids already in the inbox of `address`: take it BEFORE the action that sends a new e-mail. */
const inboxSnapshot = async (address: string) => new Set(await idsFor(address));

/** Waits for a message to `address` that is not in `seen` (the queue delivers asynchronously). */
async function inboxMessage(address: string, seen: Set<string>): Promise<Inbox> {
  for (let attempt = 0; attempt < 40; attempt++) {
    const id = (await idsFor(address)).find((candidate) => !seen.has(candidate));
    if (id) return (await (await fetch(`${MAILPIT}/api/v1/message/${id}`)).json()) as Inbox;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`no new e-mail arrived for ${address}`);
}

const tokenOf = (message: { Text: string }) => /token=([\w-]+)/.exec(message.Text)![1];

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

  describe.skipIf(!mailpitUp)(
    "e-mails through the queue (needs Mailpit and the API pointed at it)",
    () => {
      it("recovers a password from the e-mailed link", async () => {
        await signOut();
        const seen = await inboxSnapshot(email);
        expect(await requestPasswordRecovery({ email })).toEqual({ email });

        const message = await inboxMessage(email, seen);
        expect(message.Subject).toBe("Crie uma nova senha no Bordo");
        expect(message.HTML).toContain("Criar nova senha");
        const token = tokenOf(message);
        expect(await fetchResetToken(token)).toEqual({ email });

        await resetPassword({ token, password: NEW_PASSWORD });
        expect(await status(fetchResetToken(token))).toBe(410);
        expect(await status(signIn({ email, password: PASSWORD }))).toBe(401);
        expect((await signIn({ email, password: NEW_PASSWORD })).email).toBe(email);
      });

      it("changes the e-mail: link to the new address, confirmation, notice to the old one", async () => {
        const seenNew = await inboxSnapshot(newEmail);
        const seenOld = await inboxSnapshot(email);
        expect(await requestEmailChange(newEmail)).toEqual({ email: newEmail });

        const message = await inboxMessage(newEmail, seenNew);
        expect(message.Subject).toBe("Confirme seu novo e-mail no Bordo");
        const token = tokenOf(message);
        expect(await fetchEmailChangeToken(token)).toEqual({ email: newEmail });
        expect((await fetchProfile()).email).toBe(email);

        expect(await confirmEmailChange(token)).toEqual({ email: newEmail });
        expect(await status(fetchSession())).toBe(401);
        expect(await status(confirmEmailChange(token))).toBe(410);

        const notice = await inboxMessage(email, seenOld);
        expect(notice.Subject).toBe("O e-mail da sua conta no Bordo foi alterado");
        expect(notice.Text).toContain(newEmail);

        expect(await status(signIn({ email, password: NEW_PASSWORD }))).toBe(401);
        expect((await signIn({ email: newEmail, password: NEW_PASSWORD })).emailVerified).toBe(
          true,
        );
      });
    },
  );

  describe("account", () => {
    it("deletes the account and the session stops working", async () => {
      expect((await deleteProfile()).id).toBeTruthy();
      expect(await status(fetchSession())).toBe(401);
    });
  });
});
