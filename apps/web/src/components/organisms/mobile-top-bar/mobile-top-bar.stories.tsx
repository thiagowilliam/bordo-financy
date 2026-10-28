import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MobileTopBar } from "./mobile-top-bar";

const meta = {
  title: "Organisms/MobileTopBar",
  component: MobileTopBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    user: { name: "Marina", email: "marina@email.com" },
    onSignOut: () => {},
    className: "px-5 py-2",
  },
} satisfies Meta<typeof MobileTopBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
