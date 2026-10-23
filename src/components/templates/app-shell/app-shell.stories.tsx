import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Logo } from "@/components/atoms/logo";
import { PagePlaceholder } from "@/components/molecules/page-placeholder";

import { AppShell } from "./app-shell";

const meta = {
  title: "Templates/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    sidebar: <Logo />,
    children: <PagePlaceholder title="Minhas viagens" description="Conteúdo da página." />,
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
