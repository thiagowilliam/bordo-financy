import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BudgetAdjustPopover } from "./budget-adjust-popover";

const meta = {
  title: "Organisms/BudgetAdjustPopover",
  component: BudgetAdjustPopover,
  tags: ["autodocs"],
  args: {
    budgetInCents: 500000,
    spentInCents: 362130,
    currency: "EUR",
    onSave: () => {},
  },
  decorators: [
    (Story) => (
      <div className="flex h-80 items-start p-6">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BudgetAdjustPopover>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OpenBelowSpent: Story = { args: { open: true, budgetInCents: 300000 } };
export const Pending: Story = { args: { open: true, isPending: true } };
export const Mobile: Story = {
  args: { open: true },
  globals: { viewport: { value: "mobile1" } },
};
