import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PhotoPicker } from "./photo-picker";

const meta = {
  title: "Organisms/PhotoPicker",
  component: PhotoPicker,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="max-w-160">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PhotoPicker>;
export default meta;
type Story = StoryObj<typeof meta>;

/** Pick or drop images to see previews, the cover tag and the remove buttons. */
export const Default: Story = {};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
