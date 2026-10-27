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

describe("CategoryIcon soft tone", () => {
  it("uses a tinted background and colored icon", () => {
    const { container } = render(<CategoryIcon icon="utensils" color={3} tone="soft" />);
    expect(container.firstElementChild).toHaveClass("bg-chart-3/13", "text-chart-3");
    expect(container.firstElementChild).not.toHaveClass("text-white");
  });
});
