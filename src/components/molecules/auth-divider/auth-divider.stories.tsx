import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AuthDivider } from "./auth-divider";

const meta = {
  title: "Molecules/AuthDivider",
  component: AuthDivider,
  tags: ["autodocs"],
} satisfies Meta<typeof AuthDivider>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const CustomLabel: Story = { args: { children: "ou entre com e-mail" } };
