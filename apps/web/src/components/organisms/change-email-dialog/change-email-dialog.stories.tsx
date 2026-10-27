import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ChangeEmailDialog } from "./change-email-dialog";

const meta = {
  title: "Organisms/ChangeEmailDialog",
  component: ChangeEmailDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: () => {},
    currentEmail: "ana@exemplo.com",
  },
} satisfies Meta<typeof ChangeEmailDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Pending: Story = { args: { isPending: true } };
export const ServerError: Story = { args: { error: "Este e-mail já está em uso." } };
