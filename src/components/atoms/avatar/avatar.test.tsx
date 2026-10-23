import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Avatar } from "./avatar";

describe("Avatar", () => {
  it("renders the uppercase initial of the name", () => {
    const { container } = render(<Avatar name="  marina" />);
    expect(container).toHaveTextContent("M");
  });

  it("is hidden from assistive technology", () => {
    const { container } = render(<Avatar name="Marina" />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("applies the size variant", () => {
    const { container } = render(<Avatar name="Marina" size="lg" />);
    expect(container.firstChild).toHaveClass("size-10");
  });
});
