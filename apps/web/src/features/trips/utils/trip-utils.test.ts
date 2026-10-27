import { describe, expect, it } from "vitest";

import { formatTripPeriod } from "./trip-dates";
import { getTripBadgeLabel, getTripPhase } from "./trip-status";

const lisboa = { startDate: "2026-10-12", endDate: "2026-10-26" };

describe("trip phase and badge", () => {
  it("is ongoing during the trip, inclusive of both ends", () => {
    expect(getTripPhase(lisboa, "2026-10-12")).toBe("ongoing");
    expect(getTripPhase(lisboa, "2026-10-26")).toBe("ongoing");
    expect(getTripBadgeLabel(lisboa, "2026-10-22")).toBe("Dia 11 de 15");
  });

  it("is upcoming before the start", () => {
    expect(getTripPhase(lisboa, "2026-10-11")).toBe("upcoming");
    expect(getTripBadgeLabel(lisboa, "2026-10-11")).toBe("Amanhã");
    expect(getTripBadgeLabel(lisboa, "2026-06-01")).toBe("Em 133 dias");
  });

  it("is completed after the end", () => {
    expect(getTripPhase(lisboa, "2026-10-27")).toBe("completed");
    expect(getTripBadgeLabel(lisboa, "2026-10-27")).toBe("Concluída");
  });
});

describe("formatTripPeriod", () => {
  it("formats a period within one month", () => {
    expect(formatTripPeriod(lisboa, { showYear: false })).toBe("12 – 26 out");
    expect(formatTripPeriod({ startDate: "2027-03-04", endDate: "2027-03-18" })).toBe(
      "04 – 18 mar 2027",
    );
  });

  it("formats a period across months and years", () => {
    expect(formatTripPeriod({ startDate: "2026-10-28", endDate: "2026-11-03" })).toBe(
      "28 out – 03 nov 2026",
    );
    expect(formatTripPeriod({ startDate: "2026-12-28", endDate: "2027-01-03" })).toBe(
      "28 dez 2026 – 03 jan 2027",
    );
  });
});
