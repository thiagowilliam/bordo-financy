import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarDays, Camera, LayoutDashboard, Wallet } from "lucide-react";

import { TripTabBar } from "./trip-tab-bar";

const meta = {
  title: "Organisms/TripTabBar",
  component: TripTabBar,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
    nextjs: { navigation: { pathname: "/viagens/t1/dia-a-dia" } },
  },
  globals: { viewport: { value: "mobile1", isRotated: false } },
  args: {
    onLaunch: () => {},
    items: [
      { href: "/viagens/t1" as never, label: "Visão geral", icon: <LayoutDashboard /> },
      { href: "/viagens/t1/custos-base" as never, label: "Custos de base", icon: <Wallet /> },
      { href: "/viagens/t1/dia-a-dia" as never, label: "Dia a dia", icon: <CalendarDays /> },
      { href: "/viagens/t1/fotos" as never, label: "Fotos", icon: <Camera /> },
    ],
  },
} satisfies Meta<typeof TripTabBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const OverviewActive: Story = {
  parameters: { nextjs: { navigation: { pathname: "/viagens/t1" } } },
};
