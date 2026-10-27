import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FormField } from "@/components/molecules/form-field";

import { PasswordField } from "./password-field";

const meta = {
  title: "Molecules/PasswordField",
  component: PasswordField,
  tags: ["autodocs"],
  args: { placeholder: "Sua senha", autoComplete: "current-password" },
} satisfies Meta<typeof PasswordField>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { "aria-label": "Senha" } };
export const Filled: Story = { args: { "aria-label": "Senha", defaultValue: "segredo123" } };
export const Invalid: Story = { args: { "aria-label": "Senha", "aria-invalid": true } };
export const Disabled: Story = { args: { "aria-label": "Senha", disabled: true } };

export const InsideFormField: Story = {
  render: (args) => (
    <FormField label="Senha" error="A senha precisa ter ao menos 8 caracteres">
      {(control) => <PasswordField {...args} {...control} />}
    </FormField>
  ),
};
