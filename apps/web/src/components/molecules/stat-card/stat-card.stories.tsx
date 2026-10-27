import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Bed, Plane } from "lucide-react";

import { StatCard } from "./stat-card";

const meta = {
  title: "Molecules/StatCard",
  component: StatCard,
  tags: ["autodocs"],
  args: {
    icon: <Plane />,
    label: "Custos de base",
    valueInCents: 260490,
    currency: "EUR",
    description: "Voos, hospedagem e seguro",
  },
  decorators: [
    (Story) => (
      <div className="w-60">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const BaseCosts: Story = {};

export const WithCompactDescription: Story = {
  args: {
    description: "Voos, hospedagem, seguro e aluguel de carro",
    compactDescription: "Voos, hospedagem e seguro",
  },
};

export const DailyExpenses: Story = {
  args: {
    icon: <Bed />,
    label: "Dia a dia",
    valueInCents: 101640,
    description: "11 dias lançados",
  },
};
