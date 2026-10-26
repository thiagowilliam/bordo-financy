import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ExpenseRow } from "./expense-row";

const meta = {
  title: "Molecules/ExpenseRow",
  component: ExpenseRow,
  tags: ["autodocs"],
  args: {
    description: "Jantar no Time Out Market",
    categoryName: "Alimentação",
    categoryIcon: "utensils",
    categoryColor: 2,
    dateLabel: "Hoje",
    amountInCents: 4850,
    currency: "EUR",
  },
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ExpenseRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongDescription: Story = {
  args: {
    description: "Ingresso para o Palácio da Pena e o Parque com audioguia em português",
    categoryName: "Passeios",
    categoryIcon: "ticket",
    categoryColor: 3,
    dateLabel: "Ontem",
    amountInCents: 3900,
  },
};
