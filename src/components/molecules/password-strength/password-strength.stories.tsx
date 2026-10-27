import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PasswordStrength } from "./password-strength";

const meta = {
  title: "Molecules/PasswordStrength",
  component: PasswordStrength,
  tags: ["autodocs"],
  args: { password: "" },
} satisfies Meta<typeof PasswordStrength>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Weak: Story = { args: { password: "abc" } };
export const WeakTwoRules: Story = { args: { password: "abcdefg1" } };
export const Medium: Story = { args: { password: "Abcdefg1" } };
export const Strong: Story = { args: { password: "Abcdef1!" } };
