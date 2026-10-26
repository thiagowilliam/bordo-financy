import { Pencil, Trash2 } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RowActionButton } from "@/components/molecules/row-action-button";

import { CostGroup } from "./cost-group";

const meta = {
  title: "Organisms/CostGroup",
  component: CostGroup,
  tags: ["autodocs"],
  args: {
    name: "Passagem",
    icon: "plane",
    color: 1,
    shareLabel: "45,5% do total",
    subtotalInCents: 118640,
    currency: "EUR",
    items: [
      {
        id: "out",
        description: "Voo de ida GRU → LIS · TAP",
        paidOnLabel: "Pago em 14 jul",
        amountInCents: 61240,
        currency: "EUR",
      },
      {
        id: "back",
        description: "Voo de volta LIS → GRU · TAP",
        paidOnLabel: "Pago em 14 jul",
        amountInCents: 57400,
        currency: "EUR",
      },
    ],
  },
  decorators: [
    (Story) => (
      <div className="w-[760px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CostGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SingleItem: Story = {
  args: {
    name: "Hospedagem",
    icon: "bed",
    color: 2,
    shareLabel: "40,3% do total",
    subtotalInCents: 105000,
    items: [
      {
        id: "hotel",
        description: "Hotel em Lisboa · 7 noites",
        paidOnLabel: "Pago em 20 jul",
        amountInCents: 105000,
        currency: "EUR",
      },
    ],
  },
};

export const Selectable: Story = {
  args: {
    items: [
      {
        id: "out",
        description: "Voo de ida GRU → LIS · TAP",
        paidOnLabel: "Pago em 14 jul",
        amountInCents: 61240,
        currency: "EUR",
        onSelect: () => {},
        actions: (
          <>
            <RowActionButton icon={<Pencil />} label="Editar custo" />
            <RowActionButton tone="destructive" icon={<Trash2 />} label="Excluir custo" />
          </>
        ),
      },
    ],
  },
};
