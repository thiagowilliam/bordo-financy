import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { BaseCostsSummary } from "./base-costs-summary";

const meta = {
  title: "Organisms/BaseCostsSummary",
  component: BaseCostsSummary,
  tags: ["autodocs"],
  args: {
    totalInCents: 260490,
    budgetInCents: 500000,
    currency: "EUR",
    itemCount: 10,
    typeCount: 7,
  },
} satisfies Meta<typeof BaseCostsSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithMobileAction: Story = {
  args: {
    action: (
      <Button>
        <Plus aria-hidden /> Adicionar custo
      </Button>
    ),
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

export const LargeTotalOnMobile: Story = {
  args: { totalInCents: 1099015, budgetInCents: 2500000 },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
