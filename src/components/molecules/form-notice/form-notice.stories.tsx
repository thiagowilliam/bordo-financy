import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FormNotice } from "./form-notice";

const meta = {
  title: "Molecules/FormNotice",
  component: FormNotice,
  tags: ["autodocs"],
  args: { children: "Enviamos um link para o seu e-mail. Confira a caixa de entrada." },
} satisfies Meta<typeof FormNotice>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Success: Story = { args: { tone: "success" } };
