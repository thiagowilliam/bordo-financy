import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GoogleLogo } from "./google-logo";

const meta = {
  title: "Atoms/GoogleLogo",
  component: GoogleLogo,
  tags: ["autodocs"],
} satisfies Meta<typeof GoogleLogo>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Large: Story = { args: { className: "size-10" } };
