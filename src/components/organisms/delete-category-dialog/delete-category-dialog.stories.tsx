import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DeleteCategoryDialog } from "./delete-category-dialog";

const meta = {
  title: "Organisms/DeleteCategoryDialog",
  component: DeleteCategoryDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    onConfirm: () => {},
    name: "Gorjetas",
    usageCount: 3,
    totalInCents: 2800,
    currency: "EUR",
    targets: [
      { id: "1", name: "Alimentação", icon: "utensils", color: 1 },
      { id: "2", name: "Passeios", icon: "ticket", color: 2 },
      { id: "3", name: "Transporte", icon: "bus", color: 3 },
    ],
  },
} satisfies Meta<typeof DeleteCategoryDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const WithUsage: Story = {};
export const Unused: Story = { args: { usageCount: 0, totalInCents: 0 } };
export const NoTargets: Story = { args: { targets: [] } };
export const Pending: Story = { args: { isPending: true } };
