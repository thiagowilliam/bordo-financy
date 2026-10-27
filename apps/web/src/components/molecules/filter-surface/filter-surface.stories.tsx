"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Tag } from "lucide-react";
import { useState } from "react";

import { FilterButton } from "@/components/molecules/filter-button";

import { FilterSurface } from "./filter-surface";

const meta = {
  title: "Molecules/FilterSurface",
  component: FilterSurface,
  tags: ["autodocs"],
  args: { trigger: null, open: false, onOpenChange: () => {}, title: "Categoria", children: null },
  render: function Render() {
    const [open, setOpen] = useState(false);
    return (
      <FilterSurface
        open={open}
        onOpenChange={setOpen}
        title="Categoria"
        popoverClassName="w-80"
        trigger={<FilterButton icon={<Tag />} label="Categoria" open={open} />}
      >
        <p className="p-2 text-sm text-muted-foreground">Conteúdo do filtro</p>
      </FilterSurface>
    );
  },
} satisfies Meta<typeof FilterSurface>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
