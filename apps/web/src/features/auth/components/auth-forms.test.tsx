import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { toast } from "sonner";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

import {
  MOCK_EMAIL_TAKEN_TOKEN,
  MOCK_EXPIRED_TOKEN,
  MOCK_WRONG_PASSWORD,
} from "@/mocks/handlers/auth";
import { server } from "@/mocks/server";

import { http, HttpResponse } from "msw";

import { ConfirmEmailScreen } from "./confirm-email-screen";
import { ForgotPasswordScreen } from "./forgot-password-screen";
import { ResetPasswordScreen } from "./reset-password-screen";
import { SignInScreen } from "./sign-in-screen";
import { SignUpScreen } from "./sign-up-screen";
import { SignInForm } from "./sign-in-form";
import { SignUpForm } from "./sign-up-form";

const replace = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

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

describe("SignInScreen", () => {
  it("offers Google before the e-mail form", () => {
    renderWithClient(<SignInScreen />);
    expect(screen.getByRole("button", { name: "Continuar com Google" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Bem-vindo de volta" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("confirms a sign out with a toast and drops the param", async () => {
    renderWithClient(<SignInScreen signedOut />);
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith("Você saiu da sua conta.", { id: "signed-out" }),
    );
    expect(replace).toHaveBeenCalledWith("/entrar");
  });

  it("shows no toast on a normal visit", () => {
    vi.mocked(toast.success).mockClear();
    renderWithClient(<SignInScreen />);
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("explains a failed Google sign in", () => {
    renderWithClient(<SignInScreen error="google" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Não foi possível entrar com Google. Tente novamente.",
    );
  });

  it("asks for the password when the e-mail already has an account", () => {
    renderWithClient(<SignInScreen error="account-exists" />);
    expect(screen.getByRole("alert")).toHaveTextContent("vincular o Google à sua conta");
  });
});

describe("SignUpScreen", () => {
  it("offers Google and links the terms", () => {
    renderWithClient(<SignUpScreen />);
    expect(screen.getByRole("button", { name: "Continuar com Google" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Termos de uso" })).toHaveAttribute("href", "/termos");
    expect(screen.getByRole("link", { name: "Política de privacidade" })).toHaveAttribute(
      "href",
      "/privacidade",
    );
  });
});

describe("ForgotPasswordScreen", () => {
  it("validates the e-mail", async () => {
    renderWithClient(<ForgotPasswordScreen />);
    await userEvent.type(screen.getByLabelText("E-mail"), "marina@");
    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));
    expect(await screen.findByText("E-mail inválido")).toBeInTheDocument();
  });

  it("confirms without revealing if the account exists, and waits to resend", async () => {
    renderWithClient(<ForgotPasswordScreen />);
    await userEvent.type(screen.getByLabelText("E-mail"), "marina@email.com");
    await userEvent.click(screen.getByRole("button", { name: "Enviar link" }));

    expect(await screen.findByRole("heading", { name: "Confira seu e-mail" })).toBeInTheDocument();
    expect(screen.getByText(/Se existir uma conta com marina@email.com/)).toBeInTheDocument();
    expect(screen.getByText("Reenviar em 0:45")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "reenviar" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voltar para entrar" })).toHaveAttribute(
      "href",
      "/entrar",
    );
  });
});

describe("ResetPasswordScreen", () => {
  const save = () => screen.getByRole("button", { name: "Salvar nova senha" });

  it("shows the expired state for a spent or missing link", async () => {
    renderWithClient(<ResetPasswordScreen token={MOCK_EXPIRED_TOKEN} />);
    expect(await screen.findByRole("heading", { name: "Este link expirou" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Enviar novo link" })).toHaveAttribute(
      "href",
      "/recuperar-senha",
    );
  });

  it("treats a missing token as expired", () => {
    renderWithClient(<ResetPasswordScreen />);
    expect(screen.getByRole("heading", { name: "Este link expirou" })).toBeInTheDocument();
  });

  it("only saves a strong password that matches the confirmation", async () => {
    renderWithClient(<ResetPasswordScreen token="abc" />);
    expect(await screen.findByText("Para a conta marina@email.com")).toBeInTheDocument();
    expect(save()).toBeDisabled();

    await userEvent.type(screen.getByLabelText("Nova senha"), "fraca");
    await userEvent.type(screen.getByLabelText("Confirmar nova senha"), "fraca");
    expect(save()).toBeDisabled();

    await userEvent.clear(screen.getByLabelText("Nova senha"));
    await userEvent.type(screen.getByLabelText("Nova senha"), "Senha#1234");
    expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(save()).toBeDisabled();

    await userEvent.clear(screen.getByLabelText("Confirmar nova senha"));
    await userEvent.type(screen.getByLabelText("Confirmar nova senha"), "Senha#1234");
    await waitFor(() => expect(save()).toBeEnabled());
  });

  it("confirms the new password and offers to sign in", async () => {
    renderWithClient(<ResetPasswordScreen token="abc" />);
    await screen.findByText("Para a conta marina@email.com");
    await userEvent.type(screen.getByLabelText("Nova senha"), "Senha#1234");
    await userEvent.type(screen.getByLabelText("Confirmar nova senha"), "Senha#1234");
    await waitFor(() => expect(save()).toBeEnabled());
    await userEvent.click(save());

    expect(await screen.findByRole("heading", { name: "Senha atualizada" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar no Bordo" })).toHaveAttribute(
      "href",
      "/entrar",
    );
  });
});

describe("ConfirmEmailScreen", () => {
  const confirm = () => screen.getByRole("button", { name: "Confirmar novo e-mail" });

  it("checks the link, then offers to confirm the new address", async () => {
    renderWithClient(<ConfirmEmailScreen token="abc" />);
    expect(screen.getByRole("status", { name: "Verificando o link" })).toBeInTheDocument();
    expect(await screen.findByText("novo@email.com")).toBeInTheDocument();
    expect(confirm()).toBeEnabled();
  });

  it("confirms and offers to sign in again", async () => {
    renderWithClient(<ConfirmEmailScreen token="abc" />);
    await screen.findByText("novo@email.com");
    await userEvent.click(confirm());

    expect(await screen.findByRole("heading", { name: "E-mail atualizado" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Entrar no Bordo" })).toHaveAttribute(
      "href",
      "/entrar",
    );
  });

  it("clears the whole query cache once confirmed", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    client.setQueryData(["profile"], { id: "old" });
    render(
      <QueryClientProvider client={client}>
        <ConfirmEmailScreen token="abc" />
      </QueryClientProvider>,
    );
    await screen.findByText("novo@email.com");
    await userEvent.click(confirm());
    await screen.findByRole("heading", { name: "E-mail atualizado" });
    expect(client.getQueryData(["profile"])).toBeUndefined();
  });

  it("shows the expired state for a spent link", async () => {
    renderWithClient(<ConfirmEmailScreen token={MOCK_EXPIRED_TOKEN} />);
    expect(await screen.findByRole("heading", { name: "Este link expirou" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para o perfil" })).toHaveAttribute(
      "href",
      "/perfil",
    );
  });

  it("treats a missing token as expired", () => {
    renderWithClient(<ConfirmEmailScreen />);
    expect(screen.getByRole("heading", { name: "Este link expirou" })).toBeInTheDocument();
  });

  it("explains when the address is now used by another account", async () => {
    renderWithClient(<ConfirmEmailScreen token={MOCK_EMAIL_TAKEN_TOKEN} />);
    await screen.findByText("novo@email.com");
    await userEvent.click(confirm());
    expect(
      await screen.findByText("Este e-mail já está em uso por outra conta."),
    ).toBeInTheDocument();
    expect(confirm()).toBeEnabled();
  });

  it("shows a generic error and keeps the button usable", async () => {
    server.use(
      http.post("/api/auth/email-change/confirm", () => new HttpResponse(null, { status: 500 })),
    );
    renderWithClient(<ConfirmEmailScreen token="abc" />);
    await screen.findByText("novo@email.com");
    await userEvent.click(confirm());
    expect(
      await screen.findByText("Não foi possível confirmar agora. Tente novamente."),
    ).toBeInTheDocument();
    expect(confirm()).toBeEnabled();
  });
});
