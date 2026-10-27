import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Button } from "@/components/ui/button";

import { WelcomeLayout } from "./welcome-layout";

const meta = {
  title: "Templates/WelcomeLayout",
  component: WelcomeLayout,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    imageSrc: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1320&q=80",
    quote: "Cada viagem merece um diário que cabe no bolso.",
    place: "Praia de Ipanema, Rio de Janeiro",
    footer: "Seus dados ficam só com você.",
    children: (
      <>
        <h1 className="text-[28px] font-bold text-foreground">Bem-vinda ao Bordo</h1>
        <Button variant="cta" size="lg" className="mt-auto">
          Continuar
        </Button>
      </>
    ),
  },
} satisfies Meta<typeof WelcomeLayout>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutFooter: Story = { args: { footer: undefined } };
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
