import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProfileInfoSection } from "./profile-info-section";

const meta = {
  title: "Organisms/ProfileInfoSection",
  component: ProfileInfoSection,
  tags: ["autodocs"],
  args: {
    name: "Marina Alves",
    onNameChange: () => {},
    currency: "BRL",
    onCurrencyChange: () => {},
    email: "marina@exemplo.com",
    emailVerified: true,
    onChangeEmail: () => {},
  },
} satisfies Meta<typeof ProfileInfoSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Unverified: Story = { args: { emailVerified: false } };
export const WithError: Story = { args: { name: "", nameError: "Informe seu nome." } };
export const Disabled: Story = { args: { disabled: true } };
