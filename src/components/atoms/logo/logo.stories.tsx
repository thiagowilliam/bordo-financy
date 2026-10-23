import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Logo } from "./logo";

const meta = {
  title: "Atoms/Logo",
  component: Logo,
  tags: ["autodocs"],
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutTagline: Story = { args: { hideTagline: true } };
