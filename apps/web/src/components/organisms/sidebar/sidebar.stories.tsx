import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CalendarDays, LayoutDashboard } from "lucide-react";

import { TripMenu } from "@/components/organisms/trip-menu";

import { Sidebar } from "./sidebar";

const meta = {
  title: "Organisms/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", nextjs: { navigation: { pathname: "/viagens" } } },
  args: { user: { name: "Marina", email: "marina@email.com" } },
  decorators: [
    (Story) => (
      <div className="h-[720px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithTripMenu: Story = {
  parameters: { nextjs: { navigation: { pathname: "/viagens/t1/dia-a-dia" } } },
  args: {
    tripMenu: (
      <TripMenu
        tripName="Lisboa e Porto"
        period="12 – 26 out"
        coverPhotoUrl={null}
        items={[
          { href: "/viagens/t1" as never, label: "Visão geral", icon: <LayoutDashboard /> },
          { href: "/viagens/t1/dia-a-dia" as never, label: "Dia a dia", icon: <CalendarDays /> },
        ]}
      />
    ),
  },
};
