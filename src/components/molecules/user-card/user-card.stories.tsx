import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UserCard } from "./user-card";

const meta = {
  title: "Molecules/UserCard",
  component: UserCard,
  tags: ["autodocs"],
  args: { name: "Marina", email: "marina@email.com" },
} satisfies Meta<typeof UserCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
