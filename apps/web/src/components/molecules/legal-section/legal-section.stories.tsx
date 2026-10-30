import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LegalSection } from "./legal-section";

const meta = {
  title: "Molecules/LegalSection",
  component: LegalSection,
  tags: ["autodocs"],
  args: {
    id: "dados-coletados",
    title: "1. Dados que coletamos",
    children: (
      <>
        <p>
          Coletamos apenas o necessário para o funcionamento do Bordo, como seu nome, e-mail e os
          dados das suas viagens.
        </p>
        <ul>
          <li>Dados de cadastro</li>
          <li>Viagens, custos e gastos registrados</li>
          <li>Fotos que você enviar</li>
        </ul>
        <p>
          Dúvidas? Escreva para <a href="mailto:contato@bordo.app">contato@bordo.app</a>.
        </p>
      </>
    ),
  },
} satisfies Meta<typeof LegalSection>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const OrderedList: Story = {
  args: {
    children: (
      <ol>
        <li>Crie sua conta</li>
        <li>Cadastre uma viagem</li>
        <li>Lance seus gastos</li>
      </ol>
    ),
  },
};
