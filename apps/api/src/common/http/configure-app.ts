import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import fastifyCookie from "@fastify/cookie";
import helmet from "@fastify/helmet";
import { Logger } from "nestjs-pino";

export const API_PREFIX = "api";

/** Everything main.ts and the e2e tests must share, so tests exercise the real setup. */
export async function configureApp(app: NestFastifyApplication) {
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(API_PREFIX);
  await app.register(helmet);
  await app.register(fastifyCookie);
  app
    .getHttpAdapter()
    .getInstance()
    .addHook("onRequest", async (request, reply) => {
      reply.header("x-request-id", request.id);
      // Fastify answers 400 to a request that declares JSON but has no body (a bodyless POST sent
      // with a JSON content type, like sign out). No body means no content type to parse.
      const hasBody =
        request.headers["transfer-encoding"] !== undefined ||
        Number(request.headers["content-length"] ?? 0) > 0;
      if (!hasBody) delete request.headers["content-type"];
    });
  app.enableShutdownHooks();
}
