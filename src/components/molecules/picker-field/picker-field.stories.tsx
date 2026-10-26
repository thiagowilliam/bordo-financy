import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Calendar, CreditCard } from "lucide-react";

import { PickerField } from "./picker-field";

const meta = {
  title: "Molecules/PickerField",
  component: PickerField,
  tags: ["autodocs"],
  args: { label: "Forma de pagamento", placeholder: "Selecionar" },
} satisfies Meta<typeof PickerField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { icon: <CreditCard />, valueLabel: "Cartão internacional" } };
export const WithPrimaryIcon: Story = {
  args: {
    label: "Data",
    icon: <Calendar className="text-primary" />,
    valueLabel: "Hoje, 22 out · Dia 11",
  },
};
export const WithError: Story = { args: { error: "Escolha uma forma de pagamento" } };
export const Disabled: Story = { args: { disabled: true } };
