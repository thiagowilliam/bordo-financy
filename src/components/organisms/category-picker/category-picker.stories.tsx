import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { CategoryPicker, type CategoryPickerOption } from "./category-picker";

const LisbonCategories: CategoryPickerOption[] = [
  { id: "food", name: "Alimentação", icon: "utensils", color: 1, usageCount: 12 },
  { id: "tours", name: "Passeios", icon: "camera", color: 2, usageCount: 5 },
  { id: "transport", name: "Transporte", icon: "bus", color: 3, usageCount: 5 },
  { id: "shopping", name: "Compras", icon: "shopping-bag", color: 4, usageCount: 3 },
  { id: "fuel", name: "Combustível", icon: "fuel", color: 5, usageCount: 2 },
  { id: "tips", name: "Gorjetas", icon: "coins", color: 6, usageCount: 3 },
  { id: "health", name: "Saúde e outros", icon: "heart-pulse", color: 7, usageCount: 1 },
];

const meta = {
  title: "Organisms/CategoryPicker",
  component: CategoryPicker,
  tags: ["autodocs"],
  args: { value: undefined, categories: LisbonCategories, onValueChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <CategoryPicker {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof CategoryPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Selected: Story = { args: { value: "food" } };
export const WithCreate: Story = { args: { onCreateCategory: () => {} } };
export const Creating: Story = { args: { onCreateCategory: () => {}, isCreating: true } };
export const WithError: Story = { args: { error: "Escolha uma categoria" } };
