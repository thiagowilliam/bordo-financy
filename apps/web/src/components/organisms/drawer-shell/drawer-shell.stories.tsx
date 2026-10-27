import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";

import { DrawerShell } from "./drawer-shell";

const meta = {
  title: "Organisms/DrawerShell",
  component: DrawerShell,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    title: "Lançar gasto",
    context: "Lisboa & Sintra · Dia 11",
    description: "Registre um gasto da viagem.",
    children: <p className="text-sm text-muted-foreground">Campos do formulário aqui.</p>,
    footer: <Button className="h-auto w-full py-4">Salvar gasto</Button>,
  },
} satisfies Meta<typeof DrawerShell>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};
export const WithoutFooter: Story = { args: { footer: undefined } };
