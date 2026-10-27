import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SettingsNote } from "./settings-note";

const meta = {
  title: "Molecules/SettingsNote",
  component: SettingsNote,
  tags: ["autodocs"],
  args: {
    children:
      "Categorias padrão não podem ser excluídas, apenas ocultadas. Lançamentos antigos mantêm a categoria original.",
  },
} satisfies Meta<typeof SettingsNote>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
