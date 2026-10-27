import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PhotoAddTile } from "./photo-add-tile";

const meta = {
  title: "Molecules/PhotoAddTile",
  component: PhotoAddTile,
  tags: ["autodocs"],
  args: { onFiles: () => {}, className: "h-57.5" },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PhotoAddTile>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
