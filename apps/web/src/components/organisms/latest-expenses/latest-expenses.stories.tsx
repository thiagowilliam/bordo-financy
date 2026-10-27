import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { Route } from "next";

import { LatestExpenses } from "./latest-expenses";

const href = "/viagens/trip-lisboa-sintra/dia-a-dia" as Route;

const meta = {
  title: "Organisms/LatestExpenses",
  component: LatestExpenses,
  tags: ["autodocs"],
  args: {
    viewAllHref: href,
    expenses: [
      {
        id: "1",
        href,
        description: "Jantar no Time Out Market",
        categoryName: "Alimentação",
        categoryIcon: "utensils",
        categoryColor: 2,
        dateLabel: "Hoje",
        amountInCents: 4850,
        currency: "EUR",
      },
      {
        id: "2",
        href,
        description: "Ingresso Palácio da Pena",
        categoryName: "Passeios",
        categoryIcon: "ticket",
        categoryColor: 3,
        dateLabel: "Ontem",
        amountInCents: 2000,
        currency: "EUR",
      },
      {
        id: "3",
        href,
        description: "Bilhete de trem para Sintra",
        categoryName: "Transporte",
        categoryIcon: "bus",
        categoryColor: 7,
        dateLabel: "20 out",
        amountInCents: 460,
        currency: "EUR",
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LatestExpenses>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = { args: { expenses: [] } };
