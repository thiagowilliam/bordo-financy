import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Breadcrumb } from "./breadcrumb";

const meta = {
  title: "Molecules/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  args: { items: [{ label: "Minhas viagens", href: "/viagens" }, { label: "Nova viagem" }] },
} satisfies Meta<typeof Breadcrumb>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const ThreeLevels: Story = {
  args: {
    items: [
      { label: "Minhas viagens", href: "/viagens" },
      { label: "Configurações", href: "/configuracoes/categorias" },
      { label: "Categorias" },
    ],
  },
};
