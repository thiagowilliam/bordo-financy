"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { CategoryFilter } from "./category-filter";
import { lisbonCategoryOptions } from "./category-filter.fixtures";

const meta = {
  title: "Organisms/CategoryFilter",
  component: CategoryFilter,
  tags: ["autodocs"],
  args: { options: lisbonCategoryOptions, value: [], onValueChange: () => {} },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <CategoryFilter {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof CategoryFilter>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const WithSelection: Story = { args: { value: ["food", "tours"] } };
