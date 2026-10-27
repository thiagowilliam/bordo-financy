import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TravelerHistory } from "./traveler-history";

const meta = {
  title: "Organisms/TravelerHistory",
  component: TravelerHistory,
  tags: ["autodocs"],
  args: {
    trips: 4,
    daysTraveled: 38,
    destinations: 6,
    total: { amountInCents: 1842000, currency: "BRL" },
  },
} satisfies Meta<typeof TravelerHistory>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Empty: Story = {
  args: {
    trips: 0,
    daysTraveled: 0,
    destinations: 0,
    total: { amountInCents: 0, currency: "BRL" },
  },
};
