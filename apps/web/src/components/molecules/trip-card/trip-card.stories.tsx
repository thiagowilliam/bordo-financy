import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import type { Route } from "next";

import { TripCard } from "./trip-card";

const cover =
  "https://images.unsplash.com/photo-1541322841511-e0aed2019f2a?auto=format&fit=crop&w=800&q=80";

const meta = {
  title: "Molecules/TripCard",
  component: TripCard,
  tags: ["autodocs"],
  args: {
    href: "/viagens/trip-lisboa-sintra" as Route,
    name: "Lisboa & Sintra",
    destination: "Portugal",
    period: "12 – 26 out",
    badgeLabel: "Dia 11 de 15",
    coverPhotoUrl: cover,
    spentInCents: 362130,
    budgetInCents: 500000,
    currency: "EUR",
  },
  decorators: [
    (Story) => (
      <div className="w-85">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TripCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const OngoingOk: Story = {};

export const OngoingWarning: Story = { args: { spentInCents: 420000, badgeLabel: "Dia 11 de 15" } };

export const Upcoming: Story = {
  args: {
    name: "Kyoto & Osaka",
    destination: "Japão",
    period: "04 – 18 mar 2027",
    badgeLabel: "Em 133 dias",
    spentInCents: 0,
    budgetInCents: 640000,
    currency: "JPY",
  },
};

export const CompletedOver: Story = {
  args: {
    name: "Bali",
    destination: "Indonésia",
    period: "08 – 22 fev 2026",
    badgeLabel: "Concluída",
    spentInCents: 1890000,
    budgetInCents: 1750000,
    currency: "BRL",
  },
};

export const CompletedOk: Story = {
  args: { badgeLabel: "Concluída", spentInCents: 310000, period: "02 – 12 jun 2026" },
};

export const WithoutCover: Story = { args: { coverPhotoUrl: null } };

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-full">
        <Story />
      </div>
    ),
  ],
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
