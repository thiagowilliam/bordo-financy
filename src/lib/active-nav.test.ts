import { describe, expect, it } from "vitest";

import { findActiveHref } from "./active-nav";

describe("findActiveHref", () => {
  const items = [{ href: "/viagens" }, { href: "/viagens/nova" }, { href: "/viagens/1/fotos" }];

  it("prefers the longest matching prefix", () => {
    expect(findActiveHref("/viagens/nova", items)).toBe("/viagens/nova");
    expect(findActiveHref("/viagens/1/fotos/x", items)).toBe("/viagens/1/fotos");
  });

  it("ignores prefix matches for exact items", () => {
    const exact = [{ href: "/viagens", exact: true }, { href: "/viagens/1" }];
    expect(findActiveHref("/viagens/1/dia-a-dia", exact)).toBe("/viagens/1");
    expect(findActiveHref("/viagens", exact)).toBe("/viagens");
    expect(findActiveHref("/viagens/2", exact)).toBeUndefined();
  });
});
