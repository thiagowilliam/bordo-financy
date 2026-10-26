import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CostItemRow } from "./cost-item-row";

const meta = {
  title: "Molecules/CostItemRow",
  component: CostItemRow,
  tags: ["autodocs"],
  args: {
    description: "Voo de ida GRU → LIS · TAP",
    paidOnLabel: "Pago em 14 jul",
    amountInCents: 61240,
    currency: "EUR",
  },
  decorators: [
    (Story) => (
      <div className="w-[560px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CostItemRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const LongDescription: Story = {
  args: { description: "Hospedagem em Lisboa, apartamento inteiro no Chiado com café da manhã" },
  decorators: [
    (Story) => (
      <div className="w-[320px]">
        <Story />
      </div>
    ),
  ],
};
