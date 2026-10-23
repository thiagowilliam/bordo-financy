import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
  it("renders title and description", () => {
    render(<EmptyState title="Sem viagens" description="Crie a primeira." />);
    expect(screen.getByRole("heading", { level: 2, name: "Sem viagens" })).toBeInTheDocument();
    expect(screen.getByText("Crie a primeira.")).toBeInTheDocument();
  });

  it("renders the illustration and action slots", () => {
    render(
      <EmptyState
        title="Sem viagens"
        description="Crie a primeira."
        illustration={<div data-testid="art" />}
        action={<button type="button">Criar</button>}
      />,
    );
    expect(screen.getByTestId("art")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Criar" })).toBeInTheDocument();
  });
});
