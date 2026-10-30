import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LegalSection } from "@/components/molecules/legal-section";

import { LegalDocument } from "./legal-document";

function setup() {
  render(
    <LegalDocument title="Termos de uso" updatedAt="30 de outubro de 2026">
      <LegalSection id="a" title="Primeira">
        <p>Texto</p>
      </LegalSection>
      <LegalSection id="b" title="Segunda">
        <p>Texto</p>
      </LegalSection>
    </LegalDocument>,
  );
}

describe("LegalDocument", () => {
  it("renders the title as the only h1 inside main", () => {
    setup();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getByRole("heading", { level: 1, name: "Termos de uso" })).toBeInTheDocument();
  });

  it("shows the update date", () => {
    setup();
    expect(screen.getByText("Atualizado em 30 de outubro de 2026")).toBeInTheDocument();
  });

  it("links back to the home page", () => {
    setup();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/");
  });

  it("renders sections as h2 after the h1", () => {
    setup();
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Primeira",
      "Segunda",
    ]);
  });
});
