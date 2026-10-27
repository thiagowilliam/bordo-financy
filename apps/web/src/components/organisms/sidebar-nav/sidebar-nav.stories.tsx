import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CirclePlus, Luggage, Settings, User } from "lucide-react";

import { SidebarNav } from "./sidebar-nav";

const meta = {
  title: "Organisms/SidebarNav",
  component: SidebarNav,
  tags: ["autodocs"],
  parameters: { nextjs: { navigation: { pathname: "/viagens" } } },
  args: {
    items: [
      { href: "/viagens", label: "Minhas viagens", icon: <Luggage /> },
      { href: "/viagens/nova", label: "Nova viagem", icon: <CirclePlus /> },
      { href: "/perfil" as never, label: "Perfil", icon: <User /> },
      { href: "/configuracoes/categorias", label: "Configurações", icon: <Settings /> },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SidebarNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NewTripActive: Story = {
  parameters: { nextjs: { navigation: { pathname: "/viagens/nova" } } },
};

export const SettingsActive: Story = {
  parameters: { nextjs: { navigation: { pathname: "/configuracoes/categorias" } } },
};
