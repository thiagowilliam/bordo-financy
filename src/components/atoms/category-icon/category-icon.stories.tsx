import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CategoryIcon, categoryIcons } from "./category-icon";

const meta = {
  title: "Atoms/CategoryIcon",
  component: CategoryIcon,
  tags: ["autodocs"],
  args: { icon: "utensils", color: 7 },
  argTypes: { icon: { control: "select", options: Object.keys(categoryIcons) } },
} satisfies Meta<typeof CategoryIcon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-3">
      <CategoryIcon {...args} size="sm" />
      <CategoryIcon {...args} size="md" />
      <CategoryIcon {...args} size="lg" />
    </div>
  ),
};

export const Palette: Story = {
  render: () => (
    <div className="flex gap-3">
      {([1, 2, 3, 4, 5, 6, 7, 8] as const).map((color) => (
        <CategoryIcon key={color} icon="tag" color={color} />
      ))}
    </div>
  ),
};

export const AllIcons: Story = {
  render: () => (
    <div className="flex max-w-md flex-wrap gap-3">
      {(Object.keys(categoryIcons) as (keyof typeof categoryIcons)[]).map((icon) => (
        <CategoryIcon key={icon} icon={icon} color={7} />
      ))}
    </div>
  ),
};
