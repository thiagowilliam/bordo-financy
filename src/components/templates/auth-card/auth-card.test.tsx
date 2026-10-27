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

  it("renders the banner before the logo and heading", () => {
    render(<AuthCard title="Entrar" banner={<div role="alert">Erro</div>} />);
    const alert = screen.getByRole("alert");
    const heading = screen.getByRole("heading", { level: 1 });
    expect(alert.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("renders the icon and works without children", () => {
    render(<AuthCard title="Pronto" icon={<svg data-testid="ic" />} iconTone="success" />);
    expect(screen.getByTestId("ic")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Pronto" })).toBeInTheDocument();
  });

  it("renders several footer lines", () => {
    render(
      <AuthCard
        title="Entrar"
        footer={
          <>
            <p>Linha 1</p>
            <p>Linha 2</p>
          </>
        }
      />,
    );
    expect(screen.getByText("Linha 1")).toBeInTheDocument();
    expect(screen.getByText("Linha 2")).toBeInTheDocument();
  });
});
