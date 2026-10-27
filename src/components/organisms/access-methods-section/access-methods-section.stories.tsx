import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AccessMethodsSection } from "./access-methods-section";

const meta = {
  title: "Organisms/AccessMethodsSection",
  component: AccessMethodsSection,
  tags: ["autodocs"],
  args: {
    googleEmail: "marina@gmail.com",
    hasPassword: true,
    email: "marina@exemplo.com",
    linkSent: false,
    onSendPasswordLink: () => {},
    onConnectGoogle: () => {},
  },
} satisfies Meta<typeof AccessMethodsSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const GoogleAndPassword: Story = {};
export const GoogleOnly: Story = { args: { hasPassword: false } };
export const PasswordOnly: Story = { args: { googleEmail: null } };
export const LinkSent: Story = { args: { linkSent: true } };
