import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { PaymentPicker } from "./payment-picker";

const meta = {
  title: "Organisms/PaymentPicker",
  component: PaymentPicker,
  tags: ["autodocs"],
  args: { value: undefined, onValueChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <PaymentPicker {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof PaymentPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const International: Story = { args: { value: "INTERNATIONAL_CARD" } };
export const Pix: Story = { args: { value: "PIX" } };
export const WithError: Story = { args: { error: "Escolha uma forma de pagamento" } };
