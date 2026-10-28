import { Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env.js";

/**
 * Sends the account e-mails. There is no provider yet: the BullMQ job and the real transport come
 * next (template in the Pencil file). Until then the link is logged outside production so the flow
 * can be tried by hand. In production nothing is logged, a token must never reach the logs.
 */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(@Inject(ConfigService) private readonly config: ConfigService<Env, true>) {}

  async sendPasswordReset(to: string, link: string) {
    if (this.config.get("NODE_ENV", { infer: true }) === "production") {
      this.logger.warn("No mail provider configured: password recovery e-mail was not sent");
      return;
    }
    this.logger.log(`Password recovery link for ${to}: ${link}`);
  }
}
