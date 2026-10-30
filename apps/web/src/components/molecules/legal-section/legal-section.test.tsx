import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegalSection } from "./legal-section";

describe("LegalSection", () => {
  it("renders the title as h2 with an id derived from the id prop", () => {
    render(
      <LegalSection id="dados" title="Dados coletados">
        <p>Texto</p>
      </LegalSection>,
    );
    const heading = screen.getByRole("heading", { level: 2, name: "Dados coletados" });
    expect(heading).toHaveAttribute("id", "dados-titulo");
  });

  it("exposes a region named by the heading and anchored by id", () => {
    render(
      <LegalSection id="dados" title="Dados coletados">
        <p>Texto</p>
      </LegalSection>,
    );
    const region = screen.getByRole("region", { name: "Dados coletados" });
    expect(region).toHaveAttribute("id", "dados");
  });

  it("renders paragraphs, lists and links", () => {
    render(
      <LegalSection id="a" title="A">
        <p>Parágrafo</p>
        <ul>
          <li>Item</li>
        </ul>
        <a href="/x">Link</a>
      </LegalSection>,
    );
    expect(screen.getByText("Parágrafo")).toBeInTheDocument();
    expect(screen.getByRole("listitem")).toHaveTextContent("Item");
    expect(screen.getByRole("link", { name: "Link" })).toHaveAttribute("href", "/x");
  });
});
