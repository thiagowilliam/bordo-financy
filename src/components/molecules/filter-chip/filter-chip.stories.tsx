import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FilterChip } from "./filter-chip";

const meta = {
  title: "Molecules/FilterChip",
  component: FilterChip,
  tags: ["autodocs"],
  args: { label: "Categoria: Alimentação, Passeios", onRemove: () => {} },
} satisfies Meta<typeof FilterChip>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Short: Story = { args: { label: "Pagamento: Crédito" } };
