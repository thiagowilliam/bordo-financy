import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DeleteAccountDialog } from "./delete-account-dialog";

const meta = {
  title: "Organisms/DeleteAccountDialog",
  component: DeleteAccountDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    tripCount: 4,
    onExport: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof DeleteAccountDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Exporting: Story = { args: { isExporting: true } };
export const Pending: Story = { args: { isPending: true } };
export const ServerError: Story = { args: { error: "Não foi possível excluir a conta." } };
