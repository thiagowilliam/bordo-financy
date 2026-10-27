import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MobileTopBar } from "./mobile-top-bar";

describe("MobileTopBar", () => {
  it("renders the logo and the user initial", () => {
    const { container } = render(<MobileTopBar userName="Marina" />);
    expect(screen.getByText("Bordo")).toBeInTheDocument();
    expect(container).toHaveTextContent("M");
  });

  it("renders the tagline", () => {
    render(<MobileTopBar userName="Marina" />);
    expect(screen.getByText("Diário financeiro de viagem")).toBeInTheDocument();
  });
});
