import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AccountSheet } from "./account-sheet";

const meta = {
  title: "Organisms/AccountSheet",
  component: AccountSheet,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    user: { name: "Marina", email: "marina@email.com" },
    open: true,
    onOpenChange: () => {},
    onSignOut: () => {},
  },
} satisfies Meta<typeof AccountSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
export const SigningOut: Story = { ...Default, args: { isSigningOut: true } };
