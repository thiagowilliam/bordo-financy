import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ProfileHeaderCard } from "./profile-header-card";

const meta = {
  title: "Organisms/ProfileHeaderCard",
  component: ProfileHeaderCard,
  tags: ["autodocs"],
  args: {
    name: "Marina Alves",
    email: "marina@exemplo.com",
    memberSince: "março de 2026",
    onChangePhoto: () => {},
  },
} satisfies Meta<typeof ProfileHeaderCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPhoto: Story = {
  args: {
    photoUrl:
      "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'><rect width='96' height='96' fill='%238CC5C9'/></svg>",
  },
};
