import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BudgetTotalCard } from "./budget-total-card";

const meta = {
  title: "Organisms/BudgetTotalCard",
  component: BudgetTotalCard,
  tags: ["autodocs"],
  args: {
    spentInCents: 362130,
    budgetInCents: 500000,
    currency: "EUR",
    tripDays: 15,
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof BudgetTotalCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ok: Story = {};

export const Warning: Story = { args: { spentInCents: 420000 } };

export const Over: Story = { args: { spentInCents: 531000 } };

export const NoTripDays: Story = { args: { tripDays: undefined } };
