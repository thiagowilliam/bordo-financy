import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AuthCard, AuthFooterLink } from "./auth-card";

describe("AuthCard", () => {
  it("renders the title as h1, description, children and footer", () => {
    render(
      <AuthCard
        title="Entrar"
        description="Acesse sua conta"
        footer={<AuthFooterLink href="/criar-conta">Criar conta</AuthFooterLink>}
      >
        <button type="button">Enviar</button>
      </AuthCard>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Entrar" })).toBeInTheDocument();
    expect(screen.getByText("Acesse sua conta")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/criar-conta",
    );
    expect(screen.getByRole("main")).toBeInTheDocument();
  });

  it("omits description and footer when not provided", () => {
    render(
      <AuthCard title="Entrar">
        <span>conteudo</span>
      </AuthCard>,
    );
    expect(screen.getByText("conteudo")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
