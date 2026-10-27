import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { server } from "@/mocks/server";

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
} from "./client";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("profile api (msw)", () => {
  it("reads the profile and the traveler history", async () => {
    expect((await fetchProfile()).email).toBe("marina@email.com");
    expect(await fetchProfileStats()).toMatchObject({ trips: 8, daysTraveled: 64 });
  });

  it("updates the name and the main currency", async () => {
    const updated = await updateProfile({ name: "Marina Duarte Lima", currency: "EUR" });
    expect(updated).toMatchObject({ name: "Marina Duarte Lima", currency: "EUR" });
    expect((await fetchProfile()).name).toBe("Marina Duarte Lima");
    await expect(updateProfile({ name: "", currency: "EUR" })).rejects.toThrow();
  });

  it("sets and removes the photo", async () => {
    const withPhoto = await uploadProfilePhoto(new File(["x"], "me.jpg", { type: "image/jpeg" }));
    expect(withPhoto.photoUrl).toBeTruthy();
    expect((await removeProfilePhoto()).photoUrl).toBeNull();
  });

  it("sends the e-mail change and password links", async () => {
    expect(await requestEmailChange("nova@email.com")).toEqual({ email: "nova@email.com" });
    await expect(requestEmailChange("invalido")).rejects.toThrow();
    expect(await requestPasswordReset()).toEqual({ email: "marina@email.com" });
  });

  it("exports the expenses as CSV and deletes the account", async () => {
    const csv = await (await fetchExpensesExport()).text();
    expect(csv.split("\n")[0]).toBe('"Viagem","Data","Tipo","Descrição","Valor","Moeda"');
    expect(await deleteProfile()).toEqual({ id: "user-marina" });
  });
});
