import { describe, expect, it } from "vitest";

import { resolveAuthRedirect, resolveSignInRedirect, safeRedirectPath } from "./auth-routes";

describe("resolveAuthRedirect", () => {
  it("sends signed-out users from protected routes to sign in, keeping the destination", () => {
    expect(resolveAuthRedirect({ pathname: "/perfil", hasSession: false })).toBe(
      "/entrar?next=%2Fperfil",
    );
    expect(
      resolveAuthRedirect({
        pathname: "/viagens/abc/dia-a-dia",
        search: "?q=a",
        hasSession: false,
      }),
    ).toBe("/entrar?next=%2Fviagens%2Fabc%2Fdia-a-dia%3Fq%3Da");
  });

  it("sends signed-in users away from the guest-only routes", () => {
    expect(resolveAuthRedirect({ pathname: "/entrar", hasSession: true })).toBe("/viagens");
    expect(resolveAuthRedirect({ pathname: "/criar-conta", hasSession: true })).toBe("/viagens");
  });

  it("sends a returning user from the landing page straight to the trips", () => {
    expect(resolveAuthRedirect({ pathname: "/", hasSession: true })).toBe("/viagens");
    expect(resolveAuthRedirect({ pathname: "/", hasSession: false })).toBeNull();
  });

  it("lets everything else through", () => {
    expect(resolveAuthRedirect({ pathname: "/", hasSession: false })).toBeNull();
    expect(resolveAuthRedirect({ pathname: "/entrar", hasSession: false })).toBeNull();
    expect(resolveAuthRedirect({ pathname: "/viagens", hasSession: true })).toBeNull();
    expect(resolveAuthRedirect({ pathname: "/viagensx", hasSession: false })).toBeNull();
  });
});

describe("resolveSignInRedirect", () => {
  it("sends an expired session to sign in, keeping the destination", () => {
    expect(resolveSignInRedirect({ pathname: "/viagens/abc", search: "?q=a" })).toBe(
      "/entrar?next=%2Fviagens%2Fabc%3Fq%3Da",
    );
  });

  it("does nothing on a signed-out page, so there is no loop", () => {
    expect(resolveSignInRedirect({ pathname: "/entrar" })).toBeNull();
    expect(resolveSignInRedirect({ pathname: "/" })).toBeNull();
  });
});

describe("safeRedirectPath", () => {
  it("keeps same-origin paths", () => {
    expect(safeRedirectPath("/perfil")).toBe("/perfil");
  });

  it("falls back to the home for empty or external destinations", () => {
    expect(safeRedirectPath(null)).toBe("/viagens");
    expect(safeRedirectPath("https://evil.com")).toBe("/viagens");
    expect(safeRedirectPath("//evil.com")).toBe("/viagens");
    expect(safeRedirectPath("/\\evil.com")).toBe("/viagens");
  });
});
