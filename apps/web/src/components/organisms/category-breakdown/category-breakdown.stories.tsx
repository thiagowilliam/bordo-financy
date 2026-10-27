import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CategoryBreakdown } from "./category-breakdown";

const meta = {
  title: "Organisms/CategoryBreakdown",
  component: CategoryBreakdown,
  tags: ["autodocs"],
  args: {
    currency: "EUR",
    items: [
      { id: "lodging", name: "Hospedagem", color: 1, amountInCents: 148000 },
      { id: "flights", name: "Voos", color: 4, amountInCents: 92490 },
      { id: "food", name: "Alimentação", color: 2, amountInCents: 61230 },
      { id: "tours", name: "Passeios", color: 3, amountInCents: 28400 },
      { id: "transport", name: "Transporte", color: 7, amountInCents: 22010 },
      { id: "other", name: "Outros", color: 6, amountInCents: 10000 },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryBreakdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { items: [] } };
