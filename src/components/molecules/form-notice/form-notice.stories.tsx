import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FormNotice } from "./form-notice";

const meta = {
  title: "Molecules/FormNotice",
  component: FormNotice,
  tags: ["autodocs"],
  args: { children: "Enviamos um link para o seu e-mail. Confira a caixa de entrada." },
} satisfies Meta<typeof FormNotice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { tone: "success" } };
export const Error: Story = { args: { tone: "error", children: "E-mail ou senha incorretos." } };
export const Warning: Story = {
  args: { tone: "warning", children: "Sua sessão expirou. Entre novamente." },
};
export const CompactError: Story = {
  args: { tone: "error", compact: true, children: "E-mail ou senha incorretos." },
};
export const CompactWarning: Story = {
  args: { tone: "warning", compact: true, children: "Sua sessão expirou. Entre novamente." },
};
export const CompactSuccess: Story = {
  args: { tone: "success", compact: true, children: "Alterações salvas." },
};
