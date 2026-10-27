import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TripCard } from "@/components/molecules/trip-card";

import { TripSection } from "./trip-section";

const meta = {
  title: "Organisms/TripSection",
  component: TripSection,
  tags: ["autodocs"],
  args: { title: "Próximas", count: 2, children: null },
} satisfies Meta<typeof TripSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const cards = [
  <TripCard
    key="kyoto"
    href="/viagens/trip-kyoto-osaka"
    name="Kyoto & Osaka"
    destination="Japão"
    period="04 – 18 mar 2027"
    badgeLabel="Em 133 dias"
    coverPhotoUrl={null}
    spentInCents={0}
    budgetInCents={640000}
    currency="JPY"
  />,
  <TripCard
    key="patagonia"
    href="/viagens/trip-patagonia"
    name="Patagônia"
    destination="Chile e Argentina"
    period="10 – 24 jan 2027"
    badgeLabel="Em 79 dias"
    coverPhotoUrl={null}
    spentInCents={120000}
    budgetInCents={480000}
    currency="USD"
  />,
];

export const Default: Story = { render: (args) => <TripSection {...args}>{cards}</TripSection> };

export const Mobile: Story = {
  ...Default,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
