import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { AmountInput } from "./amount-input";

const meta = {
  title: "Molecules/AmountInput",
  component: AmountInput,
  tags: ["autodocs"],
  args: { value: 0, currency: "EUR", onValueChange: () => {}, hint: "Valor em euros (EUR)" },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <AmountInput {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof AmountInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: 1850 } };
export const ZeroDecimalCurrency: Story = { args: { currency: "JPY", value: 1200 } };
export const WithError: Story = { args: { error: "Informe um valor maior que zero" } };
