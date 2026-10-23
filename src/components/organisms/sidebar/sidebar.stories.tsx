import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Sidebar } from "./sidebar";

const meta = {
  title: "Organisms/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", nextjs: { navigation: { pathname: "/viagens" } } },
  args: { user: { name: "Marina", email: "marina@email.com" } },
  decorators: [
    (Story) => (
      <div className="h-[720px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Sidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
