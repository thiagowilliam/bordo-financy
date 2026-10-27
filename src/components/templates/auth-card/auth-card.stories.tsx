import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { KeyRound, MailCheck, TriangleAlert } from "lucide-react";

import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
import { FormNotice } from "@/components/molecules/form-notice";
import { PasswordField } from "@/components/molecules/password-field";
import { Button } from "@/components/ui/button";

import { AuthCard, AuthFooterLink } from "./auth-card";

const meta = {
  title: "Templates/AuthCard",
  component: AuthCard,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    title: "Entrar",
    description: "Acesse seu diário financeiro de viagem.",
    children: (
      <form className="flex flex-col gap-4">
        <FormField label="E-mail">
          {(control) => <TextField type="email" autoComplete="email" {...control} />}
        </FormField>
        <FormField label="Senha">
          {(control) => <PasswordField autoComplete="current-password" {...control} />}
        </FormField>
        <Button variant="cta" size="lg" type="submit">
          Entrar
        </Button>
      </form>
    ),
    footer: (
      <>
        Ainda não tem conta? <AuthFooterLink href="/criar-conta">Criar conta</AuthFooterLink>
      </>
    ),
  },
} satisfies Meta<typeof AuthCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutFooter: Story = { args: { footer: undefined } };
export const WithoutDescription: Story = { args: { description: undefined } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };

export const WithErrorBanner: Story = {
  args: {
    banner: (
      <FormNotice tone="error" compact>
        E-mail ou senha incorretos.
      </FormNotice>
    ),
  },
};
export const WithWarningBanner: Story = {
  args: {
    banner: (
      <FormNotice tone="warning" compact>
        Sua sessão expirou. Entre novamente.
      </FormNotice>
    ),
  },
};
export const WithSuccessIcon: Story = {
  args: {
    title: "Verifique seu e-mail",
    description: "Enviamos um link para redefinir sua senha.",
    icon: <MailCheck />,
    iconTone: "success",
    children: undefined,
  },
};
export const WithWarningIcon: Story = {
  args: {
    title: "Link expirado",
    icon: <TriangleAlert />,
    iconTone: "warning",
    children: undefined,
  },
};
export const WithPrimaryIcon: Story = { args: { icon: <KeyRound />, iconTone: "primary" } };
export const WithMultiLineFooter: Story = {
  args: {
    footer: (
      <>
        <p>
          Ainda não tem conta? <AuthFooterLink href="/criar-conta">Criar conta</AuthFooterLink>
        </p>
        <p>
          <AuthFooterLink href="/recuperar-senha">Esqueci a senha</AuthFooterLink>
        </p>
      </>
    ),
  },
};
