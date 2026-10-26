import { Pencil, Trash2 } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DayGroup, type DayGroupEntry } from "./day-group";

const entries: DayGroupEntry[] = [
  {
    id: "1",
    description: "Almoço no Time Out Market",
    categoryName: "Alimentação",
    categoryIcon: "utensils",
    categoryColor: 2,
    paymentMethod: "CREDIT",
    amountInCents: 2450,
    currency: "EUR",
  },
  {
    id: "2",
    description: "Metrô · Viva Viagem",
    categoryName: "Transporte",
    categoryIcon: "bus",
    categoryColor: 1,
    paymentMethod: "DEBIT",
    amountInCents: 320,
    currency: "EUR",
  },
  {
    id: "3",
    description: "Jantar no Bairro Alto",
    categoryName: "Alimentação",
    categoryIcon: "utensils",
    categoryColor: 2,
    paymentMethod: "CREDIT",
    amountInCents: 5800,
    currency: "EUR",
  },
  {
    id: "4",
    description: "Azulejos de lembrança",
    categoryName: "Compras",
    categoryIcon: "shopping-bag",
    categoryColor: 4,
    paymentMethod: "CASH",
    amountInCents: 3400,
    currency: "EUR",
  },
];

const actionClass =
  "flex size-[34px] items-center justify-center rounded-[10px] border border-border bg-card focus-visible:outline-2 focus-visible:outline-ring";

const meta = {
  title: "Organisms/DayGroup",
  component: DayGroup,
  tags: ["autodocs"],
  args: {
    label: "Dia 11 · 22 out",
    isToday: true,
    trend: { direction: "down", percent: 70 },
    totalInCents: 11970,
    currency: "EUR",
    entries,
  },
  decorators: [
    (Story) => (
      <div className="w-[720px] max-w-full">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DayGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const AboveAverage: Story = {
  args: {
    label: "Dia 10 · 21 out",
    isToday: false,
    trend: { direction: "up", percent: 23 },
    entries: [
      {
        id: "5",
        description: "Mosteiro dos Jerónimos",
        categoryName: "Passeios",
        categoryIcon: "ticket",
        categoryColor: 3,
        paymentMethod: "CREDIT",
        amountInCents: 1200,
        currency: "EUR",
      },
      {
        id: "6",
        description: "Pastéis de Belém",
        categoryName: "Alimentação",
        categoryIcon: "utensils",
        categoryColor: 2,
        paymentMethod: "CASH",
        amountInCents: 960,
        currency: "EUR",
      },
    ],
    totalInCents: 2160,
  },
};

export const WithActions: Story = {
  args: {
    renderActions: () => (
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

export const Mobile: Story = {
  decorators: [
    (Story) => (
      <div className="w-[358px]">
        <Story />
      </div>
    ),
  ],
};
