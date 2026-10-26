import { Pencil, Trash2 } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { RowActionButton } from "@/components/molecules/row-action-button";

import { EntryRow } from "./entry-row";

const actionClass =
  "flex size-[34px] items-center justify-center rounded-[10px] border border-border bg-card focus-visible:outline-2 focus-visible:outline-ring";

const meta = {
  title: "Molecules/EntryRow",
  component: EntryRow,
  tags: ["autodocs"],
  args: {
    description: "Almoço no Time Out Market",
    categoryName: "Alimentação",
    categoryIcon: "utensils",
    categoryColor: 2,
    paymentMethod: "CREDIT",
    amountInCents: 2450,
    currency: "EUR",
  },
  decorators: [
    (Story) => (
      <div className="w-[640px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EntryRow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Cash: Story = {
  args: {
    description: "Azulejos de lembrança",
    categoryName: "Compras",
    categoryIcon: "shopping-bag",
    categoryColor: 4,
    paymentMethod: "CASH",
    amountInCents: 3400,
  },
};

export const LongDescription: Story = {
  args: {
    description: "Ingresso para o Palácio da Pena e o Parque com audioguia em português",
    categoryName: "Passeios",
    categoryIcon: "ticket",
    categoryColor: 3,
    paymentMethod: "DEBIT",
    amountInCents: 3900,
  },
};

export const WithActions: Story = {
  args: {
    actions: (
      <>
        <button type="button" aria-label="Editar lançamento" className={actionClass}>
          <Pencil aria-hidden className="size-4 text-muted-foreground" />
        </button>
        <button type="button" aria-label="Excluir lançamento" className={actionClass}>
          <Trash2 aria-hidden className="size-4 text-destructive" />
        </button>
      </>
    ),
  },
};

export const Selectable: Story = { args: { onSelect: () => {} } };

export const SelectableWithActions: Story = {
  args: {
    onSelect: () => {},
    actions: (
      <>
        <RowActionButton icon={<Pencil />} label="Editar lançamento" />
        <RowActionButton tone="destructive" icon={<Trash2 />} label="Excluir lançamento" />
      </>
    ),
  },
};
