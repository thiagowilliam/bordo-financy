import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { PhotoUploadDialog } from "./photo-upload-dialog";

const meta = {
  title: "Organisms/PhotoUploadDialog",
  component: PhotoUploadDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    hasPhoto: false,
    onSave: () => {},
    onRemove: () => {},
  },
} satisfies Meta<typeof PhotoUploadDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Choose: Story = {};
export const ChooseWithPhoto: Story = { args: { hasPhoto: true } };
export const ServerError: Story = { args: { error: "Não foi possível salvar a foto." } };

const pixel = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  ),
  (c) => c.charCodeAt(0),
);

/** Picks a file through the real input to reach the crop step. */
export const Crop: Story = {
  render: (args) => <PhotoUploadDialog {...args} />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const file = new File([pixel], "foto.png", { type: "image/png" });
    await userEvent.upload(await body.findByLabelText("Arquivo de imagem"), file);
    await expect(await body.findByText("Ajustar foto")).toBeInTheDocument();
  },
};
export const Saving: Story = { args: { isPending: true, hasPhoto: true } };
