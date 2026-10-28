import { Injectable } from "@nestjs/common";

import { MailQueue } from "./mail.queue.js";

/** What the rest of the app calls to send an account e-mail. Each one only queues the message. */
@Injectable()
export class MailerService {
  constructor(private readonly queue: MailQueue) {}

  sendPasswordReset(to: string, link: string) {
    return this.queue.enqueue({ type: "password-reset", to, link });
  }

  /** To the NEW address: the link confirms the change. */
  sendEmailChange(to: string, link: string) {
    return this.queue.enqueue({ type: "email-change", to, link });
  }

  /** To the OLD address, after the change: a notice, so a takeover does not go unnoticed. */
  sendEmailChanged(to: string, newEmail: string) {
    return this.queue.enqueue({ type: "email-changed", to, newEmail });
  }
}
