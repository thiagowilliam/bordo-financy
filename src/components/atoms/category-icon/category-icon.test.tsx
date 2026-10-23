import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { CategoryIcon } from "./category-icon";

describe("CategoryIcon", () => {
  it("is hidden from assistive tech when decorative", () => {
    const { container } = render(<CategoryIcon icon="camera" color={1} />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("exposes a label when provided", () => {
    render(<CategoryIcon icon="camera" color={1} label="Passeios" />);
    expect(screen.getByRole("img", { name: "Passeios" })).toBeInTheDocument();
  });

  it("applies the category color token", () => {
    render(<CategoryIcon icon="bus" color={2} label="Transporte" />);
    expect(screen.getByRole("img")).toHaveClass("bg-chart-2");
  });
});
