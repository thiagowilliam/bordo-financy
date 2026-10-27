import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PhotoCard } from "./photo-card";

const meta = {
  title: "Molecules/PhotoCard",
  component: PhotoCard,
  tags: ["autodocs"],
  args: {
    src: "https://images.unsplash.com/photo-1541322841511-e0aed2019f2a?auto=format&fit=crop&w=1200&q=80",
    alt: "Bondinho amarelo em uma rua de Lisboa",
    size: "grid",
    onSetCover: () => {},
    onDelete: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PhotoCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Grid: Story = {};
export const Stack: Story = { args: { size: "stack" } };
export const Cover: Story = { args: { size: "cover", isCover: true } };
