import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DangerZone } from "./danger-zone";

const meta = {
  title: "Organisms/DangerZone",
  component: DangerZone,
  tags: ["autodocs"],
  args: { onDelete: () => {} },
} satisfies Meta<typeof DangerZone>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
