import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MapPin } from "lucide-react";

import { TextField } from "@/components/atoms/text-field";

import { FormField } from "./form-field";

const meta = {
  title: "Molecules/FormField",
  component: FormField,
  tags: ["autodocs"],
  args: {
    label: "Destino",
    children: (control) => <TextField {...control} icon={<MapPin />} placeholder="Ex.: Grécia" />,
  },
} satisfies Meta<typeof FormField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "País ou cidade principal" } };
export const WithError: Story = { args: { error: "Informe o destino" } };
