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
    sidebar: <Logo className="w-64 p-7" />,
    mobileHeader: <Logo hideTagline />,
    children: <PagePlaceholder title="Minhas viagens" description="Conteúdo da página." />,
  },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

export const WithMobileNav: Story = {
  args: {
    mobileNav: (
      <div className="flex h-16 items-center justify-center rounded-[32px] border border-border bg-card shadow-float">
        Abas da viagem
      </div>
    ),
  },
  globals: { viewport: { value: "mobile1", isRotated: false } },
};
