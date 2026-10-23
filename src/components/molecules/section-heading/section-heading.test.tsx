import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SectionHeading } from "./section-heading";

describe("SectionHeading", () => {
  it("renders the title as a level 2 heading and the count", () => {
    render(<SectionHeading title="Próximas" count={3} headingId="h" />);
    const heading = screen.getByRole("heading", { level: 2, name: "Próximas" });
    expect(heading).toHaveAttribute("id", "h");
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
