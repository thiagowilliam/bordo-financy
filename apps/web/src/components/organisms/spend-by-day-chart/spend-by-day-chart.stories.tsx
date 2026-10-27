import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SpendByDayChart, type SpendByDayItem } from "./spend-by-day-chart";

const amounts = [8450, 12300, 6720, 9840, 15200, 7310, 4860, 11250, 8990, 6340, 9380];

// Trip from 12 to 26 Oct, today is day 22 (11th day).
const days: SpendByDayItem[] = Array.from({ length: 15 }, (_, index) => {
  const day = 12 + index;
  const state = index < 10 ? "past" : index === 10 ? "today" : "future";
  return { day, amountInCents: state === "future" ? 0 : (amounts[index] ?? 0), state };
});

const meta = {
  title: "Organisms/SpendByDayChart",
  component: SpendByDayChart,
  tags: ["autodocs"],
  args: {
    days,
    currency: "EUR",
    averageInCents: 9240,
    subtitle: "Dia a dia, de 12 a 26 out",
  },
  decorators: [
    (Story) => (
      <div className="max-w-3xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SpendByDayChart>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const NotStarted: Story = {
  args: {
    days: days.map((item) => ({ ...item, amountInCents: 0, state: "future" as const })),
    averageInCents: 0,
  },
};
