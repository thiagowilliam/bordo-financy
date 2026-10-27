import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import { MOCK_WRONG_PASSWORD } from "@/mocks/handlers/auth";
import { server } from "@/mocks/server";

import { ForgotPasswordForm } from "./forgot-password-form";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));

beforeAll(() => server.listen({ onUnhandledFrame: "error" }));
beforeEach(() => replace.mockClear());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("SignInForm", () => {
  it("validates the fields before sending", async () => {
    renderWithClient(<SignInForm />);
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("Informe seu e-mail")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("signs in and goes to the requested page", async () => {
    renderWithClient(<SignInForm next="/perfil" />);
    await userEvent.type(screen.getByLabelText("E-mail"), "marina@email.com");
    await userEvent.type(screen.getByLabelText("Senha"), "12345678");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/perfil"));
  });

  it("ignores an external destination", async () => {
    renderWithClient(<SignInForm next="https://evil.com" />);
    await userEvent.type(screen.getByLabelText("E-mail"), "marina@email.com");
    await userEvent.type(screen.getByLabelText("Senha"), "12345678");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/viagens"));
  });

  it("shows an alert for wrong credentials", async () => {
    renderWithClient(<SignInForm />);
    await userEvent.type(screen.getByLabelText("E-mail"), "marina@email.com");
    await userEvent.type(screen.getByLabelText("Senha"), MOCK_WRONG_PASSWORD);
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("E-mail ou senha incorretos.");
    expect(replace).not.toHaveBeenCalled();
  });

  it("links to the password recovery", () => {
    renderWithClient(<SignInForm />);
    expect(screen.getByRole("link", { name: "Esqueci minha senha" })).toHaveAttribute(
      "href",
      "/recuperar-senha",
    );
  });
});

describe("SignUpForm", () => {
  async function fill(email: string, password: string, confirm: string) {
    await userEvent.type(screen.getByLabelText("E-mail"), email);
    await userEvent.type(screen.getByLabelText("Senha"), password);
    await userEvent.type(screen.getByLabelText("Confirmar senha"), confirm);
    await userEvent.click(screen.getByRole("button", { name: "Criar conta" }));
  }

  it("warns when the passwords do not match", async () => {
    renderWithClient(<SignUpForm />);
    await fill("nova@email.com", "12345678", "87654321");
    expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(replace).not.toHaveBeenCalled();
  });

  it("creates the account and goes to the onboarding", async () => {
    renderWithClient(<SignUpForm />);
    await fill("nova@email.com", "12345678", "12345678");
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/onboarding"));
  });

  it("flags an e-mail that already has an account", async () => {
    renderWithClient(<SignUpForm />);
    await fill("marina@email.com", "12345678", "12345678");
    expect(await screen.findByText("Já existe uma conta com este e-mail.")).toBeInTheDocument();
  });
});

describe("ForgotPasswordForm", () => {
  it("confirms where the link was sent", async () => {
    renderWithClient(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText("E-mail"), "marina@email.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Link enviado! Confira sua caixa de entrada em marina@email.com.",
    );
  });

  it("validates the e-mail", async () => {
    renderWithClient(<ForgotPasswordForm />);
    await userEvent.type(screen.getByLabelText("E-mail"), "marina@");
    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(await screen.findByText("E-mail inválido")).toBeInTheDocument();
  });
});
