import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SectionHeading } from "./section-heading";

const meta = {
  title: "Molecules/SectionHeading",
  component: SectionHeading,
  tags: ["autodocs"],
  args: { title: "Em andamento", count: 1 },
} satisfies Meta<typeof SectionHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
