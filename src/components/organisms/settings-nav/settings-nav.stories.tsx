import type { Route } from "next";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CreditCard, SlidersHorizontal, Tags } from "lucide-react";

import { SettingsNav } from "./settings-nav";

const meta = {
  title: "Organisms/SettingsNav",
  component: SettingsNav,
  tags: ["autodocs"],
  parameters: { nextjs: { navigation: { pathname: "/configuracoes/categorias" } } },
  args: {
    items: [
      { href: "/configuracoes/categorias", label: "Categorias", icon: <Tags /> },
      {
        href: "/configuracoes/pagamentos" as Route,
        label: "Formas de pagamento",
        icon: <CreditCard />,
        disabled: true,
      },
      {
        href: "/configuracoes/preferencias" as Route,
        label: "Preferências",
        icon: <SlidersHorizontal />,
        disabled: true,
      },
    ],
  },
} satisfies Meta<typeof SettingsNav>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
