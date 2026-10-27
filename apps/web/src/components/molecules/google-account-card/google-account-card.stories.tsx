import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { GoogleAccountCard } from "./google-account-card";

const meta = {
  title: "Molecules/GoogleAccountCard",
  component: GoogleAccountCard,
  tags: ["autodocs"],
  args: { name: "Marina", email: "marina@gmail.com" },
} satisfies Meta<typeof GoogleAccountCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithPhoto: Story = {
  args: {
    photoUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='%230E7C86'/></svg>",
  },
};
export const CustomTitle: Story = { args: { title: "Conta conectada" } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
