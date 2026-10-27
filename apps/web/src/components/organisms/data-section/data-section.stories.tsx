import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DataSection } from "./data-section";

const meta = {
  title: "Organisms/DataSection",
  component: DataSection,
  tags: ["autodocs"],
  args: { onExport: () => {} },
} satisfies Meta<typeof DataSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Exporting: Story = { args: { isExporting: true } };
