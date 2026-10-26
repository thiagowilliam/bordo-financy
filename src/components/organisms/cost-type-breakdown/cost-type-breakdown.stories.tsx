import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CostTypeBreakdown } from "./cost-type-breakdown";

const meta = {
  title: "Organisms/CostTypeBreakdown",
  component: CostTypeBreakdown,
  tags: ["autodocs"],
  args: {
    currency: "EUR",
    items: [
      { id: "flight", name: "Passagem", color: 1, amountInCents: 118640 },
      { id: "lodging", name: "Hospedagem", color: 2, amountInCents: 105000 },
      { id: "car", name: "Aluguel de carro", color: 3, amountInCents: 16800 },
      { id: "insurance", name: "Seguro viagem", color: 4, amountInCents: 8650 },
      { id: "tickets", name: "Ingressos antecipados", color: 5, amountInCents: 5200 },
      { id: "transfer", name: "Transfer", color: 6, amountInCents: 3800 },
      { id: "connectivity", name: "Conectividade", color: 7, amountInCents: 2400 },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[340px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CostTypeBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { items: [] } };
