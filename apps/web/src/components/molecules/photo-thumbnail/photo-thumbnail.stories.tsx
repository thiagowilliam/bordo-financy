import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PhotoThumbnail } from "./photo-thumbnail";

const meta = {
  title: "Molecules/PhotoThumbnail",
  component: PhotoThumbnail,
  tags: ["autodocs"],
  args: {
    src: "https://images.unsplash.com/photo-1541322841511-e0aed2019f2a?auto=format&fit=crop&w=400&q=80",
    alt: "Lisboa",
    isCover: false,
    onSetCover: () => {},
    onRemove: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-40">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PhotoThumbnail>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Cover: Story = { args: { isCover: true } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
