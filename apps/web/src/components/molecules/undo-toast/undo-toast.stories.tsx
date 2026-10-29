import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { UndoToast } from "./undo-toast";

const meta = {
  title: "Molecules/UndoToast",
  component: UndoToast,
  args: { message: "Viagem excluída", durationMs: 8000, onAction: () => undefined },
} satisfies Meta<typeof UndoToast>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
