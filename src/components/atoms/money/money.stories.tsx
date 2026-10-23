import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Money } from "./money";

const meta = {
  title: "Atoms/Money",
  component: Money,
  tags: ["autodocs"],
  args: { amount: 362130, currency: "EUR" },
} satisfies Meta<typeof Money>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Large: Story = { args: { size: "xl" } };

export const Primary: Story = { args: { size: "lg", tone: "primary" } };

export const OverBudget: Story = { args: { tone: "destructive" } };

export const WithoutCents: Story = { args: { amount: 101640, hideCents: true } };

export const Brazilian: Story = { args: { amount: 50000, currency: "BRL" } };
