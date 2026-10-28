import type { AddressInfo } from "node:net";

import { SMTPServer } from "smtp-server";
import { afterEach, describe, expect, it } from "vitest";

import { escapeHtml, renderMail } from "../src/modules/mail/mail.templates.js";
import { LogTransport, maskAddress, SmtpTransport } from "../src/modules/mail/mail.transport.js";
import { mailJobSchema } from "../src/modules/mail/mail.types.js";

const link = "https://app.bordo.test/recuperar-senha/nova?token=abc_DEF-123&x=1";

describe("templates", () => {
  it("renders the password recovery e-mail like the design", () => {
    const mail = renderMail({ type: "password-reset", to: "marina@email.com", link });
    expect(mail.subject).toBe("Crie uma nova senha no Bordo");
    expect(mail.html).toContain("Crie uma nova senha");
    expect(mail.html).toContain("Criar nova senha");
    expect(mail.html).toContain("Este link vale por 1 hora.");
    expect(mail.html).toContain("#E8734A");
    expect(mail.html).toContain('lang="pt-BR"');
    // The `&` of the query string is escaped inside the attribute.
    expect(mail.html).toContain(
      'href="https://app.bordo.test/recuperar-senha/nova?token=abc_DEF-123&amp;x=1"',
    );
    expect(mail.text).toContain(link);
    expect(mail.text).toContain("Este link vale por 1 hora.");
  });

  it("renders the e-mail change confirmation for the new address", () => {
    const mail = renderMail({ type: "email-change", to: "novo@email.com", link });
    expect(mail.subject).toBe("Confirme seu novo e-mail no Bordo");
    expect(mail.html).toContain("Confirmar novo e-mail");
    expect(mail.text).toContain(link);
  });

  it("renders the notice sent to the old address, with no button", () => {
    const mail = renderMail({
      type: "email-changed",
      to: "velho@email.com",
      newEmail: "novo@email.com",
    });
    expect(mail.subject).toBe("O e-mail da sua conta no Bordo foi alterado");
    expect(mail.html).toContain("novo@email.com");
    expect(mail.html).not.toContain("<a ");
    expect(mail.text).toContain("novo@email.com");
  });

  it("escapes what comes from the outside", () => {
    const hostile = '<script>alert("x")</script>@x.com';
    const mail = renderMail({ type: "email-changed", to: "velho@email.com", newEmail: hostile });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;@x.com");
    expect(escapeHtml(`a&b<c>"d'e`)).toBe("a&amp;b&lt;c&gt;&quot;d&#39;e");
  });
});

describe("mail job validation", () => {
  it("accepts the three jobs and refuses anything else", () => {
    expect(mailJobSchema.safeParse({ type: "password-reset", to: "a@b.com", link }).success).toBe(
      true,
    );
    expect(mailJobSchema.safeParse({ type: "email-change", to: "a@b.com", link }).success).toBe(
      true,
    );
    expect(
      mailJobSchema.safeParse({ type: "email-changed", to: "a@b.com", newEmail: "c@d.com" })
        .success,
    ).toBe(true);

    expect(
      mailJobSchema.safeParse({ type: "password-reset", to: "not-an-email", link }).success,
    ).toBe(false);
    expect(
      mailJobSchema.safeParse({ type: "password-reset", to: "a@b.com", link: "nope" }).success,
    ).toBe(false);
    expect(mailJobSchema.safeParse({ type: "spam", to: "a@b.com" }).success).toBe(false);
    expect(mailJobSchema.safeParse({ type: "email-changed", to: "a@b.com" }).success).toBe(false);
  });

  it("masks addresses for the logs", () => {
    expect(maskAddress("marina@gmail.com")).toBe("m***@gmail.com");
  });
});

/** Decodes quoted-printable, which e-mail bodies use (long lines are wrapped with `=`). */
const decodeQuotedPrintable = (text: string) =>
  text
    .replace(/=\r?\n/g, "")
    .replace(/=([0-9A-F]{2})/g, (_, hex) => String.fromCharCode(Number.parseInt(hex, 16)));

describe("SmtpTransport", () => {
  let server: SMTPServer | undefined;
  afterEach(
    () => new Promise<void>((resolve) => (server ? server.close(() => resolve()) : resolve())),
  );

  /** A real SMTP server on a random port that keeps what it receives. */
  async function fakeSmtp() {
    const received: { from: string; to: string[]; raw: string }[] = [];
    server = new SMTPServer({
      authOptional: true,
      disabledCommands: ["STARTTLS", "AUTH"],
      onMailFrom: (address, session, callback) => callback(),
      onData(stream, session, callback) {
        const chunks: Buffer[] = [];
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => {
          received.push({
            from: session.envelope.mailFrom ? session.envelope.mailFrom.address : "",
            to: session.envelope.rcptTo.map((rcpt) => rcpt.address),
            raw: Buffer.concat(chunks).toString("utf8"),
          });
          callback();
        });
      },
    });
    await new Promise<void>((resolve) => server!.listen(0, "127.0.0.1", resolve));
    return { received, url: `smtp://127.0.0.1:${(server.server.address() as AddressInfo).port}` };
  }

  it("sends a multipart message with the configured sender", async () => {
    const smtp = await fakeSmtp();
    const transport = new SmtpTransport(smtp.url, "Bordo <nao-responda@bordo.test>");
    const mail = renderMail({ type: "password-reset", to: "marina@email.com", link });

    await transport.send({ to: "marina@email.com", ...mail });

    expect(smtp.received).toHaveLength(1);
    const [message] = smtp.received;
    expect(message.from).toBe("nao-responda@bordo.test");
    expect(message.to).toEqual(["marina@email.com"]);
    expect(message.raw).toContain("From: Bordo <nao-responda@bordo.test>");
    expect(message.raw).toContain("To: marina@email.com");
    expect(message.raw).toContain("Subject: Crie uma nova senha no Bordo");
    expect(message.raw).toContain("multipart/alternative");
    expect(message.raw).toContain("Content-Type: text/plain");
    expect(message.raw).toContain("Content-Type: text/html");
    expect(decodeQuotedPrintable(message.raw)).toContain("token=abc_DEF-123");
  });

  it("rejects when the server cannot be reached, so the queue retries", async () => {
    const transport = new SmtpTransport("smtp://127.0.0.1:1", "Bordo <nao-responda@bordo.test>");
    await expect(
      transport.send({
        to: "marina@email.com",
        ...renderMail({ type: "password-reset", to: "marina@email.com", link }),
      }),
    ).rejects.toThrow();
  });

  it("the log transport only prints", async () => {
    await expect(
      new LogTransport().send({ to: "a@b.com", subject: "s", html: "<p>h</p>", text: "t" }),
    ).resolves.toBeUndefined();
  });
});
