import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PageHeader } from "./page-header";

describe("PageHeader", () => {
  it("renders the title as a level 1 heading", () => {
    render(<PageHeader title="Minhas viagens" />);
    expect(screen.getByRole("heading", { level: 1, name: "Minhas viagens" })).toBeInTheDocument();
  });

  it("renders subtitle and eyebrow when given", () => {
    render(<PageHeader title="Minhas viagens" subtitle="Subtítulo" eyebrow="Olá, Marina" />);
    expect(screen.getByText("Subtítulo")).toBeInTheDocument();
    expect(screen.getByText("Olá, Marina")).toBeInTheDocument();
  });

  it("omits optional lines by default", () => {
    const { container } = render(<PageHeader title="Minhas viagens" />);
    expect(container.querySelectorAll("p")).toHaveLength(0);
  });

  it("renders the action slot", () => {
    render(
      <PageHeader title="Minhas viagens" action={<button type="button">Nova viagem</button>} />,
    );
    expect(screen.getByRole("button", { name: "Nova viagem" })).toBeInTheDocument();
  });
});
