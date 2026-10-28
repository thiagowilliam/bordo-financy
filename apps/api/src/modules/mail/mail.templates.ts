import type { MailJob, RenderedMail } from "./mail.types.js";

/** Same tokens as the app (`globals.css`), written out: e-mail clients do not read CSS variables. */
const COLOR = {
  sand: "#F7F3EC",
  card: "#FFFFFF",
  border: "#E6DFD1",
  ink: "#1C2B2E",
  muted: "#5E7275",
  subtle: "#94A3A5",
  primary: "#0E7C86",
  primarySoft: "#E2F0F0",
  cta: "#E8734A",
} as const;

const FONT = "Figtree, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

/** Everything that comes from a user or from the database goes through here. */
export function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

interface Layout {
  preheader: string;
  icon: string;
  title: string;
  /** Paragraph, already HTML (use `escapeHtml` for dynamic parts). */
  body: string;
  button?: { label: string; href: string };
  notice: string;
}

/** The layout of the "E-mail · Recuperação de senha" design: sand page, white card, coral button. */
function layout({ preheader, icon, title, body, button, notice }: Layout): string {
  const cta = button
    ? `<tr><td style="padding:4px 0 28px 0;"><a href="${escapeHtml(button.href)}" style="display:inline-block;background:${COLOR.cta};color:#FFFFFF;font-family:${FONT};font-size:16px;font-weight:700;line-height:1;text-decoration:none;padding:16px 32px;border-radius:14px;">${escapeHtml(button.label)}</a></td></tr>`
    : "";
  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background:${COLOR.sand};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${COLOR.sand};">
<tr><td align="center" style="padding:40px 16px 32px 16px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;">
<tr><td align="center" style="padding-bottom:24px;font-family:${FONT};">
<span style="display:inline-block;width:40px;height:40px;line-height:40px;border-radius:12px;background:${COLOR.primary};color:#FFFFFF;font-size:20px;text-align:center;vertical-align:middle;">&#9875;</span>
<span style="display:inline-block;vertical-align:middle;padding-left:10px;text-align:left;font-size:20px;font-weight:700;color:${COLOR.ink};">Bordo<br><span style="font-size:11px;font-weight:400;color:${COLOR.muted};">Diário financeiro de viagem</span></span>
</td></tr>
<tr><td style="background:${COLOR.card};border:1px solid ${COLOR.border};border-radius:24px;padding:40px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td style="padding-bottom:20px;"><span style="display:inline-block;width:56px;height:56px;line-height:56px;border-radius:28px;background:${COLOR.primarySoft};color:${COLOR.primary};font-size:26px;text-align:center;">${icon}</span></td></tr>
<tr><td style="padding-bottom:20px;font-family:${FONT};font-size:28px;font-weight:700;letter-spacing:-0.6px;line-height:1.2;color:${COLOR.ink};">${escapeHtml(title)}</td></tr>
<tr><td style="padding-bottom:24px;font-family:${FONT};font-size:16px;line-height:1.5;color:${COLOR.muted};">${body}</td></tr>
${cta}
<tr><td style="border-top:1px solid ${COLOR.border};padding-top:20px;font-family:${FONT};font-size:13.5px;line-height:1.5;color:${COLOR.muted};">${escapeHtml(notice)}</td></tr>
</table>
</td></tr>
<tr><td align="center" style="padding-top:24px;font-family:${FONT};font-size:12px;color:${COLOR.subtle};">Diário financeiro de viagem</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Plain text alternative: spam filters and some readers want one, and it is what screen readers get. */
const plain = (...lines: string[]) =>
  `${lines.join("\n\n")}\n\n-- Bordo, diário financeiro de viagem\n`;

export function renderMail(job: MailJob): RenderedMail {
  switch (job.type) {
    case "password-reset": {
      const text = "Recebemos um pedido para redefinir a senha da sua conta no Bordo.";
      const notice =
        "Este link vale por 1 hora. Se você não pediu a troca, pode ignorar este e-mail: sua senha continua a mesma.";
      return {
        subject: "Crie uma nova senha no Bordo",
        html: layout({
          preheader: "Use o link para criar uma nova senha. Ele vale por 1 hora.",
          icon: "&#128273;",
          title: "Crie uma nova senha",
          body: escapeHtml(text),
          button: { label: "Criar nova senha", href: job.link },
          notice,
        }),
        text: plain("Crie uma nova senha", text, `Criar nova senha: ${job.link}`, notice),
      };
    }
    case "email-change": {
      const text =
        "Recebemos um pedido para usar este endereço como o e-mail da sua conta no Bordo.";
      const notice =
        "Este link vale por 1 hora. Se você não pediu a troca, pode ignorar este e-mail: nada muda na sua conta.";
      return {
        subject: "Confirme seu novo e-mail no Bordo",
        html: layout({
          preheader: "Confirme o novo e-mail da sua conta. O link vale por 1 hora.",
          icon: "&#9993;",
          title: "Confirme seu novo e-mail",
          body: escapeHtml(text),
          button: { label: "Confirmar novo e-mail", href: job.link },
          notice,
        }),
        text: plain("Confirme seu novo e-mail", text, `Confirmar novo e-mail: ${job.link}`, notice),
      };
    }
    case "email-changed": {
      const text = `O e-mail da sua conta no Bordo agora é ${job.newEmail}. Este aviso foi enviado para o endereço anterior.`;
      const notice =
        "Se foi você, não precisa fazer nada. Se não reconhece esta alteração, entre em contato com o suporte do Bordo.";
      return {
        subject: "O e-mail da sua conta no Bordo foi alterado",
        html: layout({
          preheader: "O e-mail da sua conta foi alterado.",
          icon: "&#9993;",
          title: "Seu e-mail foi alterado",
          body: `O e-mail da sua conta no Bordo agora é <strong style="color:${COLOR.ink};">${escapeHtml(job.newEmail)}</strong>. Este aviso foi enviado para o endereço anterior.`,
          notice,
        }),
        text: plain("Seu e-mail foi alterado", text, notice),
      };
    }
  }
}
