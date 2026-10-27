import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ListSummary } from "./list-summary";

const meta = {
  title: "Molecules/ListSummary",
  component: ListSummary,
  tags: ["autodocs"],
  args: { count: 31, dayCount: 11, totalInCents: 142080, currency: "EUR" },
  decorators: [
    (Story) => (
      <div className="w-[358px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutDays: Story = { args: { dayCount: undefined } };
export const Single: Story = { args: { count: 1, dayCount: 1, totalInCents: 2450 } };
