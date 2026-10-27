import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { formatCountdown, useCountdown } from "./use-countdown";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useCountdown", () => {
  it("counts down to zero and stops", () => {
    const { result } = renderHook(() => useCountdown());
    expect(result.current.remaining).toBe(0);

    act(() => result.current.start(2));
    expect(result.current.remaining).toBe(2);
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current.remaining).toBe(1);
    act(() => void vi.advanceTimersByTime(5000));
    expect(result.current.remaining).toBe(0);
  });
});

describe("formatCountdown", () => {
  it("writes minutes and padded seconds", () => {
    expect(formatCountdown(45)).toBe("0:45");
    expect(formatCountdown(65)).toBe("1:05");
    expect(formatCountdown(0)).toBe("0:00");
  });
});
