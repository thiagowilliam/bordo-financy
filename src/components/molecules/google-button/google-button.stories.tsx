import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GoogleButton } from "./google-button";

const meta = {
  title: "Molecules/GoogleButton",
  component: GoogleButton,
  tags: ["autodocs"],
} satisfies Meta<typeof GoogleButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { isLoading: true } };
export const Disabled: Story = { args: { disabled: true } };
export const Small: Story = { args: { size: "sm", label: "Vincular conta Google" } };
export const SmallLoading: Story = { args: { size: "sm", isLoading: true } };
