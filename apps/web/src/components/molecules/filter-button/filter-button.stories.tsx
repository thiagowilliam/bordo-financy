import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tag } from "lucide-react";

import { FilterButton } from "./filter-button";

const meta = {
  title: "Molecules/FilterButton",
  component: FilterButton,
  tags: ["autodocs"],
  args: { icon: <Tag />, label: "Categoria" },
} satisfies Meta<typeof FilterButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Active: Story = { args: { active: true, count: 2 } };
export const Open: Story = { args: { open: true } };
export const ActiveOpen: Story = { args: { active: true, open: true, count: 3 } };
