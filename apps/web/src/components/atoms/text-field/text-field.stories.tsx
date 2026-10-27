import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MapPin } from "lucide-react";

import { TextField } from "./text-field";

const meta = {
  title: "Atoms/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: { "aria-label": "Destino", placeholder: "Ex.: Grécia" },
} satisfies Meta<typeof TextField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithIcon: Story = { args: { icon: <MapPin /> } };
export const Filled: Story = { args: { icon: <MapPin />, defaultValue: "Grécia" } };
export const Invalid: Story = { args: { icon: <MapPin />, "aria-invalid": true } };
export const Disabled: Story = { args: { disabled: true } };
