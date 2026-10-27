import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SecuritySection } from "./security-section";

const meta = {
  title: "Organisms/SecuritySection",
  component: SecuritySection,
  tags: ["autodocs"],
  args: {
    provider: "PASSWORD",
    email: "marina@exemplo.com",
    linkSent: false,
    onSendPasswordLink: () => {},
  },
} satisfies Meta<typeof SecuritySection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Password: Story = {};
export const Sending: Story = { args: { isSending: true } };
export const LinkSent: Story = { args: { linkSent: true } };
export const Google: Story = { args: { provider: "GOOGLE" } };
