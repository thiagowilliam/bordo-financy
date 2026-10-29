import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DeleteTripDialog } from "./delete-trip-dialog";

const meta = {
  title: "Organisms/DeleteTripDialog",
  component: DeleteTripDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    onConfirm: () => {},
    name: "Lisboa & Sintra",
    dailyCount: 24,
    baseCount: 5,
    photoCount: 12,
  },
} satisfies Meta<typeof DeleteTripDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithExport: Story = { args: { onExportCsv: () => {} } };
export const Singular: Story = { args: { dailyCount: 1, baseCount: 1, photoCount: 1 } };
export const Pending: Story = { args: { isPending: true } };
