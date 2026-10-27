import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UnsavedChangesBar } from "./unsaved-changes-bar";

const meta = {
  title: "Organisms/UnsavedChangesBar",
  component: UnsavedChangesBar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { visible: true, onDiscard: () => {}, onSave: () => {} },
} satisfies Meta<typeof UnsavedChangesBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Saving: Story = { args: { isSaving: true } };
export const Hidden: Story = { args: { visible: false } };
