import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env.js";
import { MailQueue } from "./mail.queue.js";
import { MailTransport, LogTransport, SmtpTransport } from "./mail.transport.js";
import { MailerService } from "./mailer.service.js";

const DEFAULT_FROM = "Bordo <nao-responda@bordo.local>";

@Global()
@Module({
  providers: [
    {
      provide: MailTransport,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): MailTransport => {
        const url = config.get("MAIL_SMTP_URL", { infer: true });
        const from = config.get("MAIL_FROM", { infer: true }) ?? DEFAULT_FROM;
        return url ? new SmtpTransport(url, from) : new LogTransport();
      },
    },
    MailQueue,
    MailerService,
  ],
  exports: [MailerService],
})
export class MailModule {}
