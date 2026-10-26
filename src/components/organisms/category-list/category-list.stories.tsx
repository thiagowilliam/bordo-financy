import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CategoryList } from "./category-list";
import { lisbonCategories } from "./category-list.fixtures";

const meta = {
  title: "Organisms/CategoryList",
  component: CategoryList,
  tags: ["autodocs"],
  args: { items: lisbonCategories },
} satisfies Meta<typeof CategoryList>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { items: [] } };
