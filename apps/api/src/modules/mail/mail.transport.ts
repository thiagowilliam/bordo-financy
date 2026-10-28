import { Logger } from "@nestjs/common";
import nodemailer, { type Transporter } from "nodemailer";

import type { RenderedMail } from "./mail.types.js";

export interface OutgoingMail extends RenderedMail {
  to: string;
}

/** How an e-mail leaves the app. The queue and the templates do not know which one is in use. */
export abstract class MailTransport {
  abstract send(mail: OutgoingMail): Promise<void>;
}

/** `m***@gmail.com`: enough to follow a delivery in the logs without keeping addresses there. */
export const maskAddress = (address: string) => address.replace(/^(.).*(@.*)$/, "$1***$2");

/** Any SMTP server: Resend, Amazon SES, a Mailpit in development... */
export class SmtpTransport extends MailTransport {
  private readonly logger = new Logger(SmtpTransport.name);
  private readonly transporter: Transporter;

  constructor(
    url: string,
    private readonly from: string,
  ) {
    super();
    // Timeouts keep a stuck server from holding a worker slot for minutes: the queue retries.
    this.transporter = nodemailer.createTransport({
      url,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  async send({ to, subject, html, text }: OutgoingMail) {
    const info = await this.transporter.sendMail({ from: this.from, to, subject, html, text });
    this.logger.log(`Sent "${subject}" to ${maskAddress(to)} (${info.messageId})`);
  }
}

/**
 * Development without an SMTP server: prints the message, which carries the link. Never used in
 * production (the environment requires SMTP there): a token must not reach production logs.
 */
export class LogTransport extends MailTransport {
  private readonly logger = new Logger(LogTransport.name);

  async send({ to, subject, text }: OutgoingMail) {
    this.logger.log(`E-mail to ${to}: ${subject}\n${text}`);
  }
}
