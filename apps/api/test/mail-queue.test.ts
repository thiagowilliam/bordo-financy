import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { afterEach, describe, expect, inject, it, vi } from "vitest";

import { createTestApp } from "./helpers/create-test-app.js";

const redisUrl = inject("testRedisUrl");

const link = "https://app.bordo.test/recuperar-senha/nova?token=abc";

async function waitFor(condition: () => boolean | Promise<boolean>, timeoutMs = 8000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await condition()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("timed out waiting for the condition");
}

describe.skipIf(!redisUrl)("mail queue (real Redis)", () => {
  let app: NestFastifyApplication | undefined;
  let prefix: string;
  let probe: Queue | undefined;
  let probeConnection: Redis | undefined;

  afterEach(async () => {
    await probe?.obliterate({ force: true }).catch(() => undefined);
    await probe?.close();
    probeConnection?.disconnect();
    await app?.close();
    app = undefined;
    probe = undefined;
  });

  /** An app with the queue on a prefix of its own, and the handles the tests need. */
  async function start(env: Record<string, string> = {}) {
    prefix = `test-${Math.random().toString(36).slice(2)}`;
    app = await createTestApp({
      REDIS_URL: redisUrl!,
      QUEUE_PREFIX: prefix,
      MAIL_RETRY_DELAY_MS: "20",
      ...env,
    });
    const { MailTransport } = await import("../src/modules/mail/mail.transport.js");
    const { MailerService } = await import("../src/modules/mail/mailer.service.js");
    const { MailQueue } = await import("../src/modules/mail/mail.queue.js");
    probeConnection = new Redis(redisUrl!, { maxRetriesPerRequest: null });
    probe = new Queue("mail", { connection: probeConnection, prefix });
    return {
      transport: app.get(MailTransport),
      mailer: app.get(MailerService),
      queue: app.get(MailQueue),
    };
  }

  const counts = () => probe!.getJobCounts("waiting", "active", "completed", "failed", "delayed");

  it("delivers a queued e-mail through the transport, rendered, and leaves nothing in Redis", async () => {
    const { transport, mailer } = await start();
    const send = vi.spyOn(transport, "send").mockResolvedValue();

    await mailer.sendPasswordReset("marina@email.com", link);
    await waitFor(() => send.mock.calls.length === 1);

    const [mail] = send.mock.calls[0];
    expect(mail.to).toBe("marina@email.com");
    expect(mail.subject).toBe("Crie uma nova senha no Bordo");
    expect(mail.text).toContain(link);

    await waitFor(async () => Object.values(await counts()).every((count) => count === 0));
    // No finished job keeps the link around.
    const keys = await probeConnection!.keys(`${prefix}:mail:*`);
    expect(keys.filter((key) => /:mail:\d+$/.test(key))).toEqual([]);
  });

  it("returns before the e-mail is sent: the request does not wait for the provider", async () => {
    const { transport, mailer } = await start();
    let release!: () => void;
    const send = vi
      .spyOn(transport, "send")
      .mockImplementation(() => new Promise<void>((resolve) => (release = resolve)));

    await mailer.sendEmailChange("novo@email.com", link);
    await waitFor(() => send.mock.calls.length === 1);
    expect((await counts()).active).toBe(1);
    release();
    await waitFor(async () => (await counts()).active === 0);
  });

  it("retries a failing provider with backoff until it works", async () => {
    const { transport, mailer } = await start();
    const send = vi
      .spyOn(transport, "send")
      .mockRejectedValueOnce(new Error("provider down"))
      .mockRejectedValueOnce(new Error("provider down"))
      .mockResolvedValue();

    await mailer.sendPasswordReset("marina@email.com", link);
    await waitFor(() => send.mock.calls.length === 3);
    await waitFor(async () => Object.values(await counts()).every((count) => count === 0));
  });

  it("gives up after 5 attempts and keeps the failed job for inspection", async () => {
    const { transport, mailer } = await start();
    const send = vi.spyOn(transport, "send").mockRejectedValue(new Error("rejected"));

    await mailer.sendEmailChanged("velho@email.com", "novo@email.com");
    await waitFor(async () => (await counts()).failed === 1);
    expect(send).toHaveBeenCalledTimes(5);
  });

  it("refuses a job with the wrong shape instead of sending it", async () => {
    const { queue, transport } = await start();
    const send = vi.spyOn(transport, "send").mockResolvedValue();
    await expect(queue.deliver({ type: "password-reset", to: "nope", link })).rejects.toThrow();
    await expect(queue.deliver({ type: "unknown" })).rejects.toThrow();
    expect(send).not.toHaveBeenCalled();
  });

  it("with the worker off, the job waits in the queue", async () => {
    const { transport, mailer } = await start({ MAIL_WORKER: "false" });
    const send = vi.spyOn(transport, "send").mockResolvedValue();

    await mailer.sendPasswordReset("marina@email.com", link);
    await waitFor(async () => (await counts()).waiting === 1);
    await new Promise((resolve) => setTimeout(resolve, 200));
    expect(send).not.toHaveBeenCalled();
  });

  it("sends directly when Redis is down, instead of losing the e-mail", async () => {
    prefix = "unused";
    app = await createTestApp({ REDIS_URL: "redis://127.0.0.1:1", QUEUE_PREFIX: prefix });
    const { MailTransport } = await import("../src/modules/mail/mail.transport.js");
    const { MailerService } = await import("../src/modules/mail/mailer.service.js");
    const send = vi.spyOn(app.get(MailTransport), "send").mockResolvedValue();

    await app.get(MailerService).sendPasswordReset("marina@email.com", link);
    expect(send).toHaveBeenCalledTimes(1);
  });
});

describe("mail without Redis", () => {
  it("sends inline, and a failing transport does not throw into the caller", async () => {
    const app = await createTestApp();
    try {
      const { MailTransport } = await import("../src/modules/mail/mail.transport.js");
      const { MailerService } = await import("../src/modules/mail/mailer.service.js");
      const send = vi
        .spyOn(app.get(MailTransport), "send")
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new Error("boom"));
      const mailer = app.get(MailerService);

      await mailer.sendPasswordReset("marina@email.com", link);
      expect(send).toHaveBeenCalledTimes(1);
      await expect(mailer.sendPasswordReset("marina@email.com", link)).resolves.toBeUndefined();
      expect(send).toHaveBeenCalledTimes(2);
    } finally {
      await app.close();
    }
  });
});
