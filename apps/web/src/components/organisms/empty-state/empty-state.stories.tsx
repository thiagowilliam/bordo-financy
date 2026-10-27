import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus } from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";

import { EmptyState } from "./empty-state";

const meta = {
  title: "Organisms/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  args: {
    title: "Sua primeira viagem começa aqui",
    description:
      "Cadastre o destino, registre os custos de base e acompanhe cada gasto sem sair do orçamento. Leva menos de um minuto.",
    illustration: (
      <Image
        src="/illustrations/empty-trips.png"
        alt=""
        width={400}
        height={300}
        className="h-auto w-65 md:w-100"
      />
    ),
    action: (
      <Button
        variant="cta"
        className="h-auto w-full gap-2 rounded-lg px-5.5 py-4 text-base font-bold md:w-auto md:px-7 md:py-[15px] [&_svg:not([class*='size-'])]:size-4.5"
      >
        <Plus aria-hidden="true" />
        Criar primeira viagem
      </Button>
    ),
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Mobile: Story = {
  globals: { viewport: { value: "mobile1", isRotated: false } },
};

export const WithoutAction: Story = { args: { action: undefined } };
