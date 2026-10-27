import { FastifyAdapter } from "@nestjs/platform-fastify";
import { randomUUID } from "node:crypto";
import type { IncomingMessage } from "node:http";

import { parseTrustProxy } from "../../config/env.js";

const REQUEST_ID_PATTERN = /^[\w.-]{1,64}$/;

export function createAdapter(trustProxy: string | undefined) {
  return new FastifyAdapter({
    trustProxy: parseTrustProxy(trustProxy),
    requestIdHeader: false,
    // Keep a caller supplied id (load balancer, web app) when it looks sane. Logs, the
    // x-request-id header and error bodies all use this same id.
    genReqId: (request: IncomingMessage) => {
      const incoming = request.headers["x-request-id"];
      return typeof incoming === "string" && REQUEST_ID_PATTERN.test(incoming)
        ? incoming
        : randomUUID();
    },
  });
}
