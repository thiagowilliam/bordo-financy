import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SegmentedControl } from "./segmented-control";

const options = [
  { value: "DAILY", label: "Dia a dia" },
  { value: "BASE", label: "Custo de base" },
];

const meta = {
  title: "Molecules/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  args: { options, value: "DAILY", onValueChange: () => {}, "aria-label": "Tipo" },
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const DailySelected: Story = {};
export const BaseSelected: Story = { args: { value: "BASE" } };
export const Interactive: Story = {
  render: function Render(args) {
    const [value, setValue] = useState("DAILY");
    return <SegmentedControl {...args} value={value} onValueChange={setValue} />;
  },
};
