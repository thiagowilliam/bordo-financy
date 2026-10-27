import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PhotoCropper } from "./photo-cropper";

const sample =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><defs><linearGradient id="g"><stop offset="0" stop-color="#0E7C86"/><stop offset="1" stop-color="#E8734A"/></linearGradient></defs><rect width="800" height="600" fill="url(#g)"/><circle cx="400" cy="300" r="120" fill="#F7F3EC"/></svg>',
  );

const meta = {
  title: "Molecules/PhotoCropper",
  component: PhotoCropper,
  tags: ["autodocs"],
  args: { src: sample },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PhotoCropper>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Zoomed: Story = { args: { defaultCrop: { x: 0.1, y: 0, zoom: 2 } } };
