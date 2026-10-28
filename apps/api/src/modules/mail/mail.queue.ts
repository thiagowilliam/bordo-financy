import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationShutdown,
  type OnModuleInit,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Queue, Worker } from "bullmq";
import { Redis } from "ioredis";

import type { Env } from "../../config/env.js";
import { renderMail } from "./mail.templates.js";
import { MailTransport, maskAddress } from "./mail.transport.js";
import { mailJobSchema, type MailJob } from "./mail.types.js";

const QUEUE_NAME = "mail";
const ATTEMPTS = 5;
/** A slow Redis must not hold a request: after this the e-mail is sent right away instead. */
const ENQUEUE_TIMEOUT_MS = 3_000;
const SHUTDOWN_GRACE_MS = 3_000;

/**
 * E-mails go through a BullMQ queue on Redis: the request that asks for one returns at once, and a
 * failing provider is retried with growing delays. Without Redis (development) they are sent inline.
 * Completed jobs are removed straight away, so links do not sit in Redis; failed ones stay for an
 * hour (the links expire in an hour too).
 */
@Injectable()
export class MailQueue implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(MailQueue.name);
  private producerConnection?: Redis;
  private workerConnection?: Redis;
  private queue?: Queue<MailJob>;
  private worker?: Worker<MailJob>;

  constructor(
    @Inject(ConfigService) private readonly config: ConfigService<Env, true>,
    private readonly transport: MailTransport,
  ) {}

  onModuleInit() {
    const url = this.config.get("REDIS_URL", { infer: true });
    if (!url) return;

    const prefix = this.config.get("QUEUE_PREFIX", { infer: true });
    // The producer fails fast when Redis is down. The worker must wait for it instead (null).
    this.producerConnection = this.connect(url, { maxRetriesPerRequest: 1 });
    this.queue = new Queue<MailJob>(QUEUE_NAME, {
      connection: this.producerConnection,
      prefix,
      defaultJobOptions: {
        attempts: ATTEMPTS,
        backoff: {
          type: "exponential",
          delay: this.config.get("MAIL_RETRY_DELAY_MS", { infer: true }),
        },
        removeOnComplete: true,
        removeOnFail: { age: 3600 },
      },
    });

    if (this.config.get("MAIL_WORKER", { infer: true })) {
      this.workerConnection = this.connect(url, { maxRetriesPerRequest: null });
      this.worker = new Worker<MailJob>(QUEUE_NAME, (job) => this.deliver(job.data), {
        connection: this.workerConnection,
        prefix,
        concurrency: 5,
      });
      this.worker.on("failed", (job, error) =>
        this.logger.warn(
          `Mail job ${job?.id} (${job?.data.type}) failed, attempt ${job?.attemptsMade}/${ATTEMPTS}: ${error.message}`,
        ),
      );
      this.worker.on("error", (error) => this.logger.warn(`Mail worker: ${error.message}`));
    }
  }

  private connect(url: string, options: { maxRetriesPerRequest: number | null }) {
    const redis = new Redis(url, options);
    // Without a listener ioredis prints every failed attempt to the console.
    redis.on("error", (error) => this.logger.warn(`Mail Redis: ${error.message}`));
    return redis;
  }

  /** Queues an e-mail. Never throws: a failure is logged and the message is sent directly. */
  async enqueue(job: MailJob): Promise<void> {
    if (this.queue) {
      try {
        await Promise.race([
          this.queue.add("send", job),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("timed out")), ENQUEUE_TIMEOUT_MS).unref(),
          ),
        ]);
        return;
      } catch (error) {
        this.logger.error(
          `Could not queue "${job.type}" for ${maskAddress(job.to)}, sending it now: ${String(error)}`,
        );
      }
    }
    await this.deliver(job).catch((error) =>
      this.logger.error(`Could not send "${job.type}" to ${maskAddress(job.to)}: ${String(error)}`),
    );
  }

  /** Renders and sends. Throwing makes BullMQ retry. */
  async deliver(data: unknown): Promise<void> {
    const job = mailJobSchema.parse(data);
    await this.transport.send({ to: job.to, ...renderMail(job) });
  }

  /**
   * Lets running jobs finish, but not forever: with Redis down the worker would wait for it to come
   * back, and the process would never exit. After the grace period the connections are cut.
   */
  async onApplicationShutdown() {
    const closing = Promise.allSettled([this.worker?.close(), this.queue?.close()]);
    await Promise.race([
      closing,
      new Promise((resolve) => setTimeout(resolve, SHUTDOWN_GRACE_MS).unref()),
    ]);
    for (const redis of [this.workerConnection, this.producerConnection]) redis?.disconnect();
  }
}
