import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProgressBar } from "./progress-bar";

const meta = {
  title: "Atoms/ProgressBar",
  component: ProgressBar,
  tags: ["autodocs"],
  args: { progress: 0.45, status: "ok", "aria-label": "Orçamento usado" },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProgressBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ok: Story = {};
export const Warning: Story = { args: { progress: 0.86, status: "warning" } };
export const Over: Story = { args: { progress: 1, status: "over" } };
export const Empty: Story = { args: { progress: 0 } };
