import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CategoryRow } from "./category-row";

const meta = {
  title: "Molecules/CategoryRow",
  component: CategoryRow,
  tags: ["autodocs"],
  args: {
    name: "Alimentação",
    icon: "utensils",
    color: 1,
    isDefault: true,
    hidden: false,
    usageCount: 12,
    totalInCents: 41230,
    currency: "EUR",
    onEdit: () => {},
    onToggleHidden: () => {},
    onDelete: () => {},
  },
} satisfies Meta<typeof CategoryRow>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Custom: Story = {
  args: {
    name: "Gorjetas",
    icon: "coins",
    color: 5,
    isDefault: false,
    usageCount: 3,
    totalInCents: 2800,
  },
};
export const Hidden: Story = {
  args: {
    name: "Saúde e outros",
    icon: "heart-pulse",
    color: 6,
    hidden: true,
    usageCount: 1,
    totalInCents: 2500,
  },
};
