"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { PaymentFilter } from "./payment-filter";

const meta = {
  title: "Organisms/PaymentFilter",
  component: PaymentFilter,
  tags: ["autodocs"],
  args: { value: undefined, onValueChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <PaymentFilter {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof PaymentFilter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Selected: Story = { args: { value: "CREDIT" } };
