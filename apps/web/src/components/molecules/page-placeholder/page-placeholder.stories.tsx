import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { PagePlaceholder } from "./page-placeholder";

const meta = {
  title: "Molecules/PagePlaceholder",
  component: PagePlaceholder,
  tags: ["autodocs"],
  args: { title: "Minhas viagens", description: "Em construção." },
} satisfies Meta<typeof PagePlaceholder>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = { args: { description: undefined } };
