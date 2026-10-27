import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TripMini } from "./trip-mini";

const meta = {
  title: "Molecules/TripMini",
  component: TripMini,
  tags: ["autodocs"],
  args: { name: "Lisboa e Porto", period: "12 – 26 out", coverPhotoUrl: null },
  decorators: [
    (Story) => (
      <div className="w-56">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TripMini>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongName: Story = {
  args: { name: "Quinze dias entre Lisboa, Porto e Sintra" },
};
