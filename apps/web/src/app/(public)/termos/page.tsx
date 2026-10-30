import type { Metadata } from "next";
import Link from "next/link";

import { LegalSection } from "@/components/molecules/legal-section";
import { LegalDocument } from "@/components/templates/legal-document";

export const metadata: Metadata = { title: "Termos de uso" };

const CONTACT_EMAIL = "thiago.will.silva@gmail.com";

export default function TermosPage() {
  return (
    <LegalDocument title="Termos de uso" updatedAt="30 de outubro de 2026">
      <LegalSection id="aceite" title="1. Aceite dos termos">
        <p>
          O Bordo é um diário financeiro de viagem. Ao criar uma conta ou usar o serviço, você
          concorda com estes termos e com a <Link href="/privacidade">Política de privacidade</Link>
          . Se não concordar, não use o Bordo.
        </p>
      </LegalSection>

      <LegalSection id="servico" title="2. O que o Bordo oferece">
        <p>
          O Bordo permite registrar viagens, custos de base (como passagens e hospedagem) e gastos
          do dia a dia, acompanhar o orçamento e guardar fotos das viagens.
        </p>
        <p>
          Os valores que você vê são os que você mesmo registra. O Bordo não é um serviço bancário,
          contábil ou de consultoria financeira, e não se conecta às suas contas ou cartões.
        </p>
      </LegalSection>

      <LegalSection id="conta" title="3. Sua conta">
        <ul>
          <li>Você pode entrar com e-mail e senha ou com a sua conta Google.</li>
          <li>As informações que você fornece devem ser verdadeiras e atualizadas.</li>
          <li>
            Você é responsável por manter a senha em segurança e por tudo o que acontece na sua
            conta. Se suspeitar de uso indevido, troque a senha e avise-nos.
          </li>
          <li>Cada pessoa deve ter a sua própria conta.</li>
        </ul>
      </LegalSection>

      <LegalSection id="uso" title="4. Uso adequado">
        <p>Você concorda em não:</p>
        <ul>
          <li>
            usar o Bordo para fins ilegais ou para enviar conteúdo que viole direitos de terceiros;
          </li>
          <li>tentar acessar contas, dados ou sistemas que não sejam seus;</li>
          <li>
            sobrecarregar, testar vulnerabilidades ou interferir no funcionamento do serviço sem
            autorização;
          </li>
          <li>fazer engenharia reversa ou extrair dados do serviço de forma automatizada.</li>
        </ul>
      </LegalSection>

      <LegalSection id="conteudo" title="5. Seu conteúdo">
        <p>
          Os dados, textos e fotos que você registra continuam sendo seus. Você nos autoriza apenas
          a armazená-los e exibi-los para você, o necessário para o serviço funcionar.
        </p>
        <p>
          Envie apenas fotos que você tenha o direito de usar. Evite registrar nas descrições
          informações sensíveis, como números completos de cartões ou senhas.
        </p>
      </LegalSection>

      <LegalSection id="seus-dados" title="6. Exportar e excluir seus dados">
        <p>
          Na página Perfil você pode exportar todos os seus gastos em CSV e excluir a sua conta. A
          exclusão apaga a conta, as viagens, os gastos, as categorias e as fotos. Ela não pode ser
          desfeita. Mais detalhes na <Link href="/privacidade">Política de privacidade</Link>.
        </p>
      </LegalSection>

      <LegalSection id="disponibilidade" title="7. Disponibilidade e mudanças no serviço">
        <p>
          Fazemos o possível para manter o Bordo no ar, mas não garantimos que ele funcione sem
          interrupções ou erros. Podemos alterar, suspender ou encerrar funcionalidades. Em caso de
          encerramento do serviço, avisaremos com antecedência razoável para que você possa exportar
          os seus dados.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidade" title="8. Limitação de responsabilidade">
        <p>
          O Bordo é fornecido &ldquo;como está&rdquo;. Na extensão permitida pela lei, não nos
          responsabilizamos por decisões financeiras tomadas com base nas informações registradas,
          por perdas decorrentes de falhas, indisponibilidade ou perda de dados, nem por danos
          indiretos. Mantenha, se for importante para você, uma cópia dos seus dados usando a
          exportação.
        </p>
        <p>Nada nestes termos limita direitos que a lei garante a você como consumidor.</p>
      </LegalSection>

      <LegalSection id="suspensao" title="9. Suspensão e encerramento">
        <p>
          Podemos suspender ou encerrar contas que violem estes termos ou coloquem o serviço ou
          outras pessoas em risco. Você pode encerrar a sua conta a qualquer momento pelo Perfil.
        </p>
      </LegalSection>

      <LegalSection id="alteracoes" title="10. Alterações nestes termos">
        <p>
          Podemos atualizar estes termos. A data de atualização fica no topo da página. Quando a
          mudança for relevante, avisaremos no aplicativo ou por e-mail. Continuar usando o Bordo
          depois da mudança significa que você a aceita.
        </p>
      </LegalSection>

      <LegalSection id="lei" title="11. Lei aplicável">
        <p>
          Estes termos seguem a lei brasileira. Qualquer disputa será resolvida no foro do seu
          domicílio, como garante o Código de Defesa do Consumidor.
        </p>
      </LegalSection>

      <LegalSection id="contato" title="12. Contato">
        <p>
          Dúvidas, suporte ou pedidos sobre estes termos:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
