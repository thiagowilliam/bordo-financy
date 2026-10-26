import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DescriptionField } from "./description-field";

const meta = {
  title: "Molecules/DescriptionField",
  component: DescriptionField,
  tags: ["autodocs"],
  args: { placeholder: "Ex.: almoço no Time Out Market" },
} satisfies Meta<typeof DescriptionField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { defaultValue: "Pastéis de Belém e café" } };
export const WithError: Story = { args: { error: "Descrição muito longa" } };
