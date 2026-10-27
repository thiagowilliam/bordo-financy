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

  it("renders the photo instead of the initial when src is set", () => {
    const { container } = render(<Avatar name="Marina" src="/foto.jpg" />);
    expect(container.querySelector("img")).toHaveAttribute("src", "/foto.jpg");
    expect(container).not.toHaveTextContent("M");
  });

  it("falls back to the initial when src is null", () => {
    const { container } = render(<Avatar name="Marina" src={null} />);
    expect(container.querySelector("img")).toBeNull();
    expect(container).toHaveTextContent("M");
  });

  it("applies the profile size", () => {
    const { container } = render(<Avatar name="Marina" size="profile" />);
    expect(container.firstChild).toHaveClass("size-20", "md:size-24");
  });

  it("applies the xl size", () => {
    const { container } = render(<Avatar name="Marina" size="xl" />);
    expect(container.firstChild).toHaveClass("size-18");
  });
});
