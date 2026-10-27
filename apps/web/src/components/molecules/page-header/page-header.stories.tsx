import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";

import { PageHeader } from "./page-header";

const meta = {
  title: "Molecules/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  args: {
    title: "Minhas viagens",
    subtitle: "Olá, Marina. Suas viagens vão aparecer aqui.",
  },
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithEyebrow: Story = { args: { subtitle: undefined, eyebrow: "Olá, Marina" } };

export const Mobile: Story = {
  ...WithEyebrow,
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

export const WithAction: Story = {
  args: { action: <Button variant="cta">Nova viagem</Button> },
};
