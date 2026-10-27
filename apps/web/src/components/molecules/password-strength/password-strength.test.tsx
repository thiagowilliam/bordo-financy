import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PasswordStrength } from "./password-strength";

describe("PasswordStrength", () => {
  it("lists the four requirements", () => {
    render(<PasswordStrength password="" />);
    expect(screen.getAllByRole("listitem")).toHaveLength(4);
    expect(screen.queryByText("Fraca")).not.toBeInTheDocument();
  });

  it.each([
    ["abc", "Fraca"],
    ["Abcdefg1", "Média"],
    ["Abcdef1!", "Forte"],
  ])("shows the level for %s", (password, label) => {
    render(<PasswordStrength password={password} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it("marks met rules and announces unmet ones politely", () => {
    const { container } = render(<PasswordStrength password="Abcdefg1" />);
    const list = within(screen.getByRole("list"));
    expect(list.getByText(/Um número/)).toHaveTextContent("(atendido)");
    expect(list.getByText(/Um caractere especial/)).toHaveTextContent("(pendente)");
    const live = container.querySelector("[aria-live='polite']");
    expect(live).toHaveTextContent("Senha média");
    expect(live).toHaveTextContent("Um caractere especial");
  });

  it("announces success when all rules are met", () => {
    const { container } = render(<PasswordStrength password="Abcdef1!" />);
    expect(container.querySelector("[aria-live='polite']")).toHaveTextContent(
      "Todos os requisitos atendidos",
    );
  });
});
