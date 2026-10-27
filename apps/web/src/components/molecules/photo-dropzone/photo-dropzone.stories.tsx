import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PhotoDropzone } from "./photo-dropzone";

const meta = {
  title: "Molecules/PhotoDropzone",
  component: PhotoDropzone,
  tags: ["autodocs"],
  args: { onFilesSelected: () => {} },
} satisfies Meta<typeof PhotoDropzone>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Disabled: Story = { args: { disabled: true } };
export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
