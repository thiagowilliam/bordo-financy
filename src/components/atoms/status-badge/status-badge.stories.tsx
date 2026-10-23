import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { StatusBadge } from "./status-badge";

const meta = {
  title: "Atoms/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  args: { status: "ok" },
} satisfies Meta<typeof StatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ok: Story = {};

export const Warning: Story = { args: { status: "warning" } };

export const Over: Story = { args: { status: "over" } };

export const CustomLabel: Story = { args: { status: "warning", label: "82% usado" } };
