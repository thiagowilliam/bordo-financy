import { Pencil, Trash2 } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RowActionButton } from "./row-action-button";

const meta = {
  title: "Molecules/RowActionButton",
  component: RowActionButton,
  tags: ["autodocs"],
  args: { icon: <Pencil />, label: "Editar lançamento" },
} satisfies Meta<typeof RowActionButton>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Destructive: Story = {
  args: { tone: "destructive", icon: <Trash2 />, label: "Excluir lançamento" },
};
