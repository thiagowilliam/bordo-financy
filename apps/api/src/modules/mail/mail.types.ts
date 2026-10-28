import { z } from "zod";

/** What goes through the queue. Redis only ever holds this, validated again by the worker. */
export const mailJobSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("password-reset"), to: z.email(), link: z.url() }),
  z.object({ type: z.literal("email-change"), to: z.email(), link: z.url() }),
  z.object({ type: z.literal("email-changed"), to: z.email(), newEmail: z.email() }),
]);

export type MailJob = z.infer<typeof mailJobSchema>;

export interface RenderedMail {
  subject: string;
  html: string;
  text: string;
}
