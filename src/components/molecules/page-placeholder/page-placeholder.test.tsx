import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PagePlaceholder } from "./page-placeholder";

describe("PagePlaceholder", () => {
  it("renders the title as the page heading", () => {
    render(<PagePlaceholder title="Minhas viagens" />);
    expect(screen.getByRole("heading", { level: 1, name: "Minhas viagens" })).toBeInTheDocument();
  });

  it("renders the description when provided", () => {
    render(<PagePlaceholder title="Fotos" description="Em construção." />);
    expect(screen.getByText("Em construção.")).toBeInTheDocument();
  });
});
