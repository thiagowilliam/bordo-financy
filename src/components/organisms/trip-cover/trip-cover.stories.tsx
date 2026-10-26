import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TripCover } from "./trip-cover";

const meta = {
  title: "Organisms/TripCover",
  component: TripCover,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    name: "Lisboa & Sintra",
    destination: "Portugal",
    period: "12 a 26 out 2026",
    phaseLabel: "Em andamento · Dia 11 de 15",
    coverPhotoUrl:
      "https://images.unsplash.com/photo-1541322841511-e0aed2019f2a?auto=format&fit=crop&w=1600&q=80",
  },
} satisfies Meta<typeof TripCover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithoutPhoto: Story = { args: { coverPhotoUrl: null } };

export const Mobile: Story = { globals: { viewport: { value: "mobile1" } } };
