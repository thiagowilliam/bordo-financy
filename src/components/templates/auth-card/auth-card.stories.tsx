import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TextField } from "@/components/atoms/text-field";
import { FormField } from "@/components/molecules/form-field";
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
