import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Luggage } from "lucide-react";

import { NavItem } from "./nav-item";

const meta = {
  title: "Molecules/NavItem",
  component: NavItem,
  tags: ["autodocs"],
  args: { href: "/viagens", label: "Minhas viagens", icon: <Luggage /> },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NavItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Active: Story = { args: { active: true } };
