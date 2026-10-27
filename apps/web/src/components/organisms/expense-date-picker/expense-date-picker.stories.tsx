import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { ExpenseDatePicker } from "./expense-date-picker";

const meta = {
  title: "Organisms/ExpenseDatePicker",
  component: ExpenseDatePicker,
  tags: ["autodocs"],
  args: {
    label: "Data",
    value: "2026-10-22",
    onValueChange: () => {},
    today: "2026-10-22",
    tripStartDate: "2026-10-12",
    tripEndDate: "2026-10-26",
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <ExpenseDatePicker {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof ExpenseDatePicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Today: Story = {};
export const PastDay: Story = { args: { value: "2026-10-21" } };
export const BeforeTrip: Story = { args: { value: "2026-10-05", label: "Data de pagamento" } };
export const WithError: Story = { args: { error: "Informe a data" } };
