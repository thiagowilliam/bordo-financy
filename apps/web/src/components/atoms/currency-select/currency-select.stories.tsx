import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import type { SupportedCurrency } from "@bordo/shared/common";

import { CurrencySelect } from "./currency-select";

const meta = {
  title: "Atoms/CurrencySelect",
  component: CurrencySelect,
  tags: ["autodocs"],
  args: { value: "BRL", onValueChange: () => {} },
  render: (args) => {
    const [value, setValue] = useState<SupportedCurrency>(args.value);
    return <CurrencySelect {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof CurrencySelect>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Euro: Story = { args: { value: "EUR" } };
export const Invalid: Story = { args: { "aria-invalid": true } };
export const Disabled: Story = { args: { disabled: true } };
