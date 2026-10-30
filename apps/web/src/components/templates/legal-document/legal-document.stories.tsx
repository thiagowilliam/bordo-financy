import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LegalSection } from "@/components/molecules/legal-section";

import { LegalDocument } from "./legal-document";

const meta = {
  title: "Templates/LegalDocument",
  component: LegalDocument,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    title: "Termos de uso",
    updatedAt: "30 de outubro de 2026",
    children: (
      <>
        <LegalSection id="aceite" title="1. Aceite dos termos">
          <p>Ao usar o Bordo você concorda com estes termos.</p>
          <ul>
            <li>Use o app de forma legal</li>
            <li>Mantenha sua conta segura</li>
          </ul>
        </LegalSection>
        <LegalSection id="contato" title="2. Contato">
          <p>
            Fale conosco em <a href="mailto:contato@bordo.app">contato@bordo.app</a>.
          </p>
        </LegalSection>
      </>
    ),
  },
} satisfies Meta<typeof LegalDocument>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Mobile: Story = { parameters: { viewport: { defaultViewport: "mobile1" } } };
