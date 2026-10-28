import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AccountMenu } from "./account-menu";

const meta = {
  title: "Organisms/AccountMenu",
  component: AccountMenu,
  tags: ["autodocs"],
  args: { user: { name: "Marina", email: "marina@email.com" }, onSignOut: () => {} },
  decorators: [
    (Story) => (
      <div className="flex h-80 w-66 items-end">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AccountMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const SigningOut: Story = { args: { isSigningOut: true } };
