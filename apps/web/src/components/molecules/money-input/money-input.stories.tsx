import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Wallet } from "lucide-react";
import { useState } from "react";

import { MoneyInput } from "./money-input";

const meta = {
  title: "Molecules/MoneyInput",
  component: MoneyInput,
  tags: ["autodocs"],
  args: {
    "aria-label": "Orçamento total",
    placeholder: "0,00",
    icon: <Wallet />,
    currency: "EUR",
    value: 0,
    onValueChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value);
    return <MoneyInput {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof MoneyInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: 540000 } };
export const Yen: Story = { args: { currency: "JPY", value: 540000 } };
export const Invalid: Story = { args: { "aria-invalid": true } };
