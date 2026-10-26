import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CategoryBar } from "./category-bar";

const meta = {
  title: "Atoms/CategoryBar",
  component: CategoryBar,
  tags: ["autodocs"],
  args: { progress: 0.6, color: 1, "aria-label": "Passagem" },
  decorators: [
    (Story) => (
      <div className="w-[300px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CategoryBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Full: Story = { args: { progress: 1, color: 3 } };
