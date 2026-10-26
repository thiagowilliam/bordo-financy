import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DayHeader } from "./day-header";

const meta = {
  title: "Molecules/DayHeader",
  component: DayHeader,
  tags: ["autodocs"],
  args: { label: "Dia 11 · 22 out", totalInCents: 14130, currency: "EUR" },
  decorators: [
    (Story) => (
      <div className="w-[720px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DayHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Today: Story = { args: { isToday: true } };
export const BelowAverage: Story = {
  args: { isToday: true, trend: { direction: "down", percent: 70 } },
};
export const AboveAverage: Story = {
  args: { trend: { direction: "up", percent: 23 } },
};
