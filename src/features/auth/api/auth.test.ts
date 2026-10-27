import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api-client";
import { MOCK_EXPIRED_TOKEN, MOCK_WRONG_PASSWORD } from "@/mocks/handlers/auth";
import { server } from "@/mocks/server";

import {
  fetchSession,
  fetchResetToken,
  getGoogleUrl,
  resetPassword,
  requestPasswordRecovery,
  signIn,
  signOut,
  signUp,
} from "./client";

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("auth api (msw)", () => {
  it("signs in and answers with the user", async () => {
    const user = await signIn({ email: "marina@email.com", password: "12345678" });
    expect(user.email).toBe("marina@email.com");
  });

  it("rejects wrong credentials with a 401", async () => {
    await expect(
      signIn({ email: "marina@email.com", password: MOCK_WRONG_PASSWORD }),
    ).rejects.toMatchObject({ status: 401 });
  });

  it("creates an account and refuses an e-mail that already has one", async () => {
    expect((await signUp({ email: "nova@email.com", password: "12345678" })).email).toBe(
      "nova@email.com",
    );
    const taken = signUp({ email: "Marina@email.com", password: "12345678" });
    await expect(taken).rejects.toBeInstanceOf(ApiError);
    await expect(taken).rejects.toMatchObject({ status: 409 });
  });

  it("reads the session, recovers the password and signs out", async () => {
    expect((await fetchSession()).id).toBe("user-marina");
    expect(await requestPasswordRecovery({ email: "x@y.com" })).toEqual({ email: "x@y.com" });
    expect(await signOut()).toEqual({});
  });

  it("builds the Google URL as a navigation target", () => {
    expect(getGoogleUrl()).toBe("/api/auth/google");
    expect(getGoogleUrl({ next: "/perfil" })).toBe("/api/auth/google?next=%2Fperfil");
    expect(getGoogleUrl({ next: "/perfil", link: true })).toBe(
      "/api/auth/google?next=%2Fperfil&link=1",
    );
  });

  it("resets the password with a valid link and refuses an expired one", async () => {
    expect(await fetchResetToken("abc")).toEqual({ email: "marina@email.com" });
    expect(await resetPassword({ token: "abc", password: "Senha#1234" })).toEqual({});
    await expect(fetchResetToken(MOCK_EXPIRED_TOKEN)).rejects.toMatchObject({ status: 410 });
    await expect(
      resetPassword({ token: MOCK_EXPIRED_TOKEN, password: "Senha#1234" }),
    ).rejects.toMatchObject({ status: 410 });
  });
});
