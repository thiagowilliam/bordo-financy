import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MapPin, Tags } from "lucide-react";

import { SidebarNav } from "./sidebar-nav";

const meta = {
  title: "Organisms/SidebarNav",
  component: SidebarNav,
  tags: ["autodocs"],
  parameters: { nextjs: { navigation: { pathname: "/viagens" } } },
  args: {
    items: [
      { href: "/viagens", label: "Minhas viagens", icon: <MapPin /> },
      { href: "/configuracoes/categorias", label: "Categorias", icon: <Tags /> },
    ],
  },
} satisfies Meta<typeof SidebarNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CategoriesActive: Story = {
  parameters: { nextjs: { navigation: { pathname: "/configuracoes/categorias" } } },
};
