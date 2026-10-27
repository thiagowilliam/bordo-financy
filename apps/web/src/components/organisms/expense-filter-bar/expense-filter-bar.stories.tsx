"use client";

import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";

import { lisbonCategoryOptions } from "@/components/organisms/category-filter/category-filter.fixtures";
import type { PeriodFilterValue } from "@/components/organisms/period-filter";
import type { PaymentMethod } from "@/features/expenses";

import { ExpenseFilterBar, type ExpenseFilterBarProps } from "./expense-filter-bar";

type State = Pick<ExpenseFilterBarProps, "search" | "categories" | "period" | "paymentMethod">;

const meta = {
  title: "Organisms/ExpenseFilterBar",
  component: ExpenseFilterBar,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: {
    search: "",
    onSearchChange: () => {},
    categoryOptions: lisbonCategoryOptions,
    categories: [],
    onCategoriesChange: () => {},
    period: null,
    onPeriodChange: () => {},
    periodBounds: { min: "2026-10-18", max: "2026-10-26" },
    paymentMethod: undefined,
    onPaymentMethodChange: () => {},
    onClear: () => {},
  },
  render: function Render(args) {
    const [state, setState] = useState<State>({
      search: args.search,
      categories: args.categories,
      period: args.period,
      paymentMethod: args.paymentMethod,
    });
    return (
      <ExpenseFilterBar
        {...args}
        {...state}
        onSearchChange={(search) => setState((s) => ({ ...s, search }))}
        onCategoriesChange={(categories: string[]) => setState((s) => ({ ...s, categories }))}
        onPeriodChange={(period: PeriodFilterValue) => setState((s) => ({ ...s, period }))}
        onPaymentMethodChange={(paymentMethod: PaymentMethod | undefined) =>
          setState((s) => ({ ...s, paymentMethod }))
        }
        onClear={() =>
          setState((s) => ({ ...s, categories: [], period: null, paymentMethod: undefined }))
        }
      />
    );
  },
} satisfies Meta<typeof ExpenseFilterBar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithActiveFilters: Story = {
  args: {
    categories: ["food", "tours"],
    period: { preset: "custom", from: "2026-10-20", to: "2026-10-22" },
    paymentMethod: "CREDIT",
    result: { count: 12, totalInCents: 23450, currency: "EUR" },
  },
};
