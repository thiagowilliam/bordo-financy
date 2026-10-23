import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { DateField } from "./date-field";

const meta = {
  title: "Molecules/DateField",
  component: DateField,
  tags: ["autodocs"],
  args: { value: "", onChange: () => {}, "aria-label": "Data de ida" },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <DateField {...args} value={value} onChange={setValue} />;
  },
} satisfies Meta<typeof DateField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: "2027-05-01" } };
export const WithMinDate: Story = { args: { minDate: "2027-05-10", defaultMonth: "2027-05-01" } };
export const Invalid: Story = { args: { "aria-invalid": true } };
