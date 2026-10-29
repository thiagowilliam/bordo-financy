import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { DialogDescription, DialogTitle } from "@/components/ui/dialog";

import { ResponsiveModal } from "./responsive-modal";

const meta = {
  title: "Organisms/ResponsiveModal",
  component: ResponsiveModal,
  tags: ["autodocs"],
  args: {
    open: true,
    onOpenChange: () => {},
    desktopClassName: "sm:max-w-[480px]",
    children: (
      <>
        <DialogTitle className="text-xl font-bold">Título do modal</DialogTitle>
        <DialogDescription className="sr-only">Descrição</DialogDescription>
      </>
    ),
  },
} satisfies Meta<typeof ResponsiveModal>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
