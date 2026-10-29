import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TripActionsMenu } from "./trip-actions-menu";

const meta = {
  title: "Organisms/TripActionsMenu",
  component: TripActionsMenu,
  tags: ["autodocs"],
  args: { onEdit: () => {}, onDelete: () => {} },
  decorators: [
    (Story) => (
      <div className="flex h-40 w-72 justify-end rounded-xl bg-primary-strong p-3">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TripActionsMenu>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { globals: { viewport: { value: "mobile1" } } };
