import type { Metadata } from "next";
import Link from "next/link";

import { LegalSection } from "@/components/molecules/legal-section";
import { LegalDocument } from "@/components/templates/legal-document";

export const metadata: Metadata = { title: "Política de privacidade" };

const CONTACT_EMAIL = "thiago.will.silva@gmail.com";

export default function PrivacidadePage() {
  return (
    <LegalDocument title="Política de privacidade" updatedAt="30 de outubro de 2026">
      <LegalSection id="introducao" title="1. Quem somos e o que esta política cobre">
        <p>
          O Bordo é um diário financeiro de viagem. Esta política explica quais dados pessoais
          tratamos, para quê, com quem os compartilhamos e quais são os seus direitos, conforme a
          Lei Geral de Proteção de Dados (LGPD, Lei 13.709/2018).
        </p>
        <p>
          O Bordo é o controlador dos seus dados. O contato para qualquer assunto de privacidade é{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </p>
      </LegalSection>

      <LegalSection id="dados" title="2. Dados que tratamos">
        <ul>
          <li>
            <strong>Conta:</strong> e-mail, nome, foto de perfil, moeda principal e, se você usa
            senha, o resultado de um processamento irreversível dela (nunca a senha em si).
          </li>
          <li>
            <strong>Login com Google:</strong> identificador da conta Google, e-mail, nome e foto
            que o Google informa. Usamos apenas os escopos básicos (openid, e-mail e perfil).
          </li>
          <li>
            <strong>O que você registra:</strong> viagens (destino, datas, orçamento, foto de capa),
            custos de base, gastos (data, categoria, forma de pagamento, valor, descrição),
            categorias e fotos.
          </li>
          <li>
            <strong>Dados técnicos:</strong> endereço IP e navegador (user agent), usados na
            segurança e na limitação de tentativas, e nas sessões de login.
          </li>
        </ul>
        <p>Não coletamos dados bancários, números de cartão nem a sua localização.</p>
      </LegalSection>

      <LegalSection id="finalidades" title="3. Para que usamos e em que base legal">
        <ul>
          <li>
            Criar e manter a sua conta e fornecer o serviço: execução do contrato (art. 7º, V da
            LGPD).
          </li>
          <li>
            Enviar e-mails da conta, como recuperação de senha e confirmação de troca de e-mail:
            execução do contrato.
          </li>
          <li>
            Proteger contas e o serviço contra abuso, com limite de tentativas e registros de
            segurança: legítimo interesse (art. 7º, IX).
          </li>
          <li>Cumprir obrigações legais, quando houver: obrigação legal (art. 7º, II).</li>
        </ul>
        <p>
          Não vendemos os seus dados, não usamos para publicidade e não fazemos perfis de
          comportamento.
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="4. Cookies">
        <p>Usamos apenas cookies estritamente necessários, que dispensam consentimento:</p>
        <ul>
          <li>
            <strong>bordo_session:</strong> mantém você conectado. Dura 30 dias e é renovado
            enquanto você usa o app. O navegador não consegue lê-lo por script.
          </li>
          <li>
            <strong>bordo_oauth:</strong> existe por até 10 minutos durante o login com Google, para
            proteger o processo, e é apagado em seguida.
          </li>
        </ul>
        <p>Não usamos cookies de análise, publicidade ou rastreamento de terceiros.</p>
      </LegalSection>

      <LegalSection id="compartilhamento" title="5. Com quem compartilhamos">
        <p>Só compartilhamos o necessário, com quem opera o serviço para nós:</p>
        <ul>
          <li>
            <strong>Google</strong>, quando você escolhe entrar com a conta Google.
          </li>
          <li>
            <strong>Provedor de hospedagem</strong>, onde o servidor, o banco de dados e as fotos
            ficam armazenados.
          </li>
          <li>
            <strong>Provedor de envio de e-mail</strong>, que entrega as mensagens da conta.
          </li>
        </ul>
        <p>
          Também podemos divulgar dados se uma autoridade competente exigir, nos termos da lei.
          Alguns desses provedores podem tratar dados fora do Brasil; nesse caso, buscamos
          provedores com padrões de proteção adequados, como prevê a LGPD.
        </p>
      </LegalSection>

      <LegalSection id="seguranca" title="6. Segurança">
        <ul>
          <li>Conexões protegidas por HTTPS.</li>
          <li>
            Senhas guardadas com Argon2id. As sessões e os links de e-mail são guardados apenas na
            forma de hash.
          </li>
          <li>Limite de tentativas em login, cadastro e recuperação de senha.</li>
        </ul>
        <p>
          Nenhum sistema é totalmente seguro. Se houver um incidente que possa causar risco
          relevante a você, avisaremos você e a Autoridade Nacional de Proteção de Dados, conforme a
          lei.
        </p>
      </LegalSection>

      <LegalSection id="retencao" title="7. Por quanto tempo guardamos">
        <p>
          Mantemos os seus dados enquanto a sua conta existir. Ao excluir a conta pelo Perfil,
          apagamos a conta, as viagens, os gastos, as categorias e as fotos. Cópias de segurança do
          banco são mantidas por até 14 dias e depois descartadas, então os dados excluídos podem
          permanecer nelas durante esse período, sem uso para outra finalidade.
        </p>
        <p>
          Registros de segurança podem ser guardados por mais tempo se a lei exigir ou para defender
          direitos.
        </p>
      </LegalSection>

      <LegalSection id="direitos" title="8. Seus direitos">
        <p>Pela LGPD, você pode a qualquer momento pedir:</p>
        <ul>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários;</li>
          <li>portabilidade dos seus dados;</li>
          <li>informação sobre com quem compartilhamos;</li>
          <li>revogação de consentimento, quando for a base usada.</li>
        </ul>
        <p>
          Muita coisa você faz sozinho no Perfil: editar nome, foto, moeda e e-mail, exportar os
          gastos em CSV, trocar a senha e excluir a conta. Para o resto, escreva para{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Respondemos em até 15 dias.
        </p>
        <p>
          Se achar que seus direitos não foram atendidos, você pode reclamar à Autoridade Nacional
          de Proteção de Dados (ANPD).
        </p>
      </LegalSection>

      <LegalSection id="criancas" title="9. Crianças e adolescentes">
        <p>
          O Bordo não é direcionado a menores de 18 anos. Se soubermos que uma conta de menor foi
          criada sem a autorização de um responsável, poderemos excluí-la.
        </p>
      </LegalSection>

      <LegalSection id="alteracoes" title="10. Alterações nesta política">
        <p>
          Podemos atualizar esta política. A data de atualização fica no topo da página e, em caso
          de mudança relevante, avisaremos no aplicativo ou por e-mail.
        </p>
      </LegalSection>

      <LegalSection id="contato" title="11. Contato">
        <p>
          Dúvidas sobre privacidade ou pedidos sobre os seus dados:{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. Veja também os{" "}
          <Link href="/termos">Termos de uso</Link>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}
