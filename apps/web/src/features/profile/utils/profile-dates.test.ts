import { describe, expect, it } from "vitest";

import { formatMemberSince } from "./profile-dates";

describe("formatMemberSince", () => {
  it("writes the month in full and the year in pt-BR", () => {
    expect(formatMemberSince("2026-03-14")).toBe("março de 2026");
  });
});
