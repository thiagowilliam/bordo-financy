import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "./logo";

describe("Logo", () => {
  it("renders the name and the tagline", () => {
    render(<Logo />);
    expect(screen.getByText("Bordo")).toBeInTheDocument();
    expect(screen.getByText("Diário financeiro de viagem")).toBeInTheDocument();
  });

  it("can hide the tagline", () => {
    render(<Logo hideTagline />);
    expect(screen.queryByText("Diário financeiro de viagem")).not.toBeInTheDocument();
  });
});
