import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GoogleLogo } from "./google-logo";

describe("GoogleLogo", () => {
  it("is decorative and has four colored paths", () => {
    const { container } = render(<GoogleLogo className="size-8" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveClass("size-8");
    expect(container.querySelectorAll("path")).toHaveLength(4);
  });
});
