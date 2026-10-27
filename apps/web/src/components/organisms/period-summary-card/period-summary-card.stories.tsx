import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PeriodSummaryCard } from "./period-summary-card";

const meta = {
  title: "Organisms/PeriodSummaryCard",
  component: PeriodSummaryCard,
  tags: ["autodocs"],
  args: {
    totalInCents: 142080,
    entryCount: 31,
    averageInCents: 12916,
    dayCount: 11,
    currency: "EUR",
    categories: [
      { id: "food", name: "Alimentação", color: 2, amountInCents: 61200 },
      { id: "tours", name: "Passeios", color: 3, amountInCents: 34800 },
      { id: "shopping", name: "Compras", color: 4, amountInCents: 24000 },
      { id: "transport", name: "Transporte", color: 1, amountInCents: 22080 },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[308px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PeriodSummaryCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: { totalInCents: 0, entryCount: 0, averageInCents: 0, categories: [] },
};
