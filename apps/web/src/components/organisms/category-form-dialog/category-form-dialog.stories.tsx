import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { CategoryFormDialog } from "./category-form-dialog";

const meta = {
  title: "Organisms/CategoryFormDialog",
  component: CategoryFormDialog,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    onSubmit: () => {},
    mode: "create",
    previewSubtitle: "0 lançamentos",
  },
} satisfies Meta<typeof CategoryFormDialog>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Create: Story = {};
export const Edit: Story = {
  args: {
    mode: "edit",
    initialValues: { name: "Alimentação", icon: "utensils", color: 1 },
    previewSubtitle: "12 lançamentos · Dia a dia",
  },
};
export const Pending: Story = { args: { ...Edit.args, isPending: true } };
export const WithError: Story = {
  args: {
    initialValues: { name: "Passeios", icon: "ticket", color: 2 },
    error: "Já existe uma categoria com esse nome",
  },
};
