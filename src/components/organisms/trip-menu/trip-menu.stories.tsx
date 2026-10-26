import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Camera, CalendarDays, LayoutDashboard, Wallet } from "lucide-react";

import { TripMenu, TripMenuSkeleton } from "./trip-menu";

const meta = {
  title: "Organisms/TripMenu",
  component: TripMenu,
  tags: ["autodocs"],
  parameters: { nextjs: { navigation: { pathname: "/viagens/t1/dia-a-dia" } } },
  args: {
    tripName: "Lisboa e Porto",
    period: "12 – 26 out",
    coverPhotoUrl: null,
    items: [
      { href: "/viagens/t1" as never, label: "Visão geral", icon: <LayoutDashboard /> },
      { href: "/viagens/t1/custos-base" as never, label: "Custos de base", icon: <Wallet /> },
      { href: "/viagens/t1/dia-a-dia" as never, label: "Dia a dia", icon: <CalendarDays /> },
      { href: "/viagens/t1/fotos" as never, label: "Fotos", icon: <Camera /> },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TripMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Loading: Story = {
  render: () => <TripMenuSkeleton />,
};
