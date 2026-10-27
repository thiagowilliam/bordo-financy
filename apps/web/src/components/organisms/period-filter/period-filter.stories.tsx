"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { PeriodFilter, type PeriodFilterValue } from "./period-filter";

const meta = {
  title: "Organisms/PeriodFilter",
  component: PeriodFilter,
  tags: ["autodocs"],
  args: {
    value: null,
    onValueChange: () => {},
    minDate: "2026-10-18",
    maxDate: "2026-10-26",
  },
  render: function Render(args) {
    const [value, setValue] = useState<PeriodFilterValue>(args.value);
    return <PeriodFilter {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof PeriodFilter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Preset: Story = { args: { value: { preset: "yesterday" } } };
export const Custom: Story = {
  args: { value: { preset: "custom", from: "2026-10-20", to: "2026-10-22" } },
};
