import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// jsdom gaps that Radix (Select, Popover) and the photo previews rely on.
Element.prototype.hasPointerCapture ??= () => false;
Element.prototype.setPointerCapture ??= () => {};
Element.prototype.releasePointerCapture ??= () => {};
Element.prototype.scrollIntoView ??= () => {};

globalThis.ResizeObserver ??= class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

let objectUrlCount = 0;
URL.createObjectURL = vi.fn(() => `blob:mock/${objectUrlCount++}`);
URL.revokeObjectURL = vi.fn();
