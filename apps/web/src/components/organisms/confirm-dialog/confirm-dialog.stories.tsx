import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LogOut } from "lucide-react";

import { ConfirmDialog } from "./confirm-dialog";

const meta = {
  title: "Organisms/ConfirmDialog",
  component: ConfirmDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    onConfirm: () => {},
    title: "Excluir lançamento?",
    description:
      "Almoço no Time Out Market será removido da viagem. Essa ação não pode ser desfeita.",
  },
} satisfies Meta<typeof ConfirmDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pending: Story = { args: { isPending: true } };
export const CustomLabel: Story = {
  args: { title: "Excluir custo?", confirmLabel: "Excluir custo" },
};
export const SignOut: Story = {
  args: {
    title: "Sair da conta?",
    description: "Você precisará entrar novamente para acessar suas viagens.",
    confirmLabel: "Sair",
    confirmIcon: <LogOut />,
    pendingLabel: "Saindo...",
  },
};
