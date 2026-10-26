"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { SearchInput } from "./search-input";

const meta = {
  title: "Molecules/SearchInput",
  component: SearchInput,
  tags: ["autodocs"],
  args: {
    value: "",
    onValueChange: () => {},
    placeholder: "Buscar por descrição",
    "aria-label": "Buscar lançamentos",
  },
  render: function Render(args) {
    const [value, setValue] = useState(args.value);
    return <SearchInput {...args} value={value} onValueChange={setValue} />;
  },
} satisfies Meta<typeof SearchInput>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const Filled: Story = { args: { value: "pastel" } };
