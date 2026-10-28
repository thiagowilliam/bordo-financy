import { Controller, Get, NotFoundException, Param, Res } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { FastifyReply } from "fastify";

import { Public } from "../../modules/auth/public.decorator.js";
import { LocalStorageService } from "./local-storage.service.js";
import { contentTypeOfKey } from "./storage-key.js";

/**
 * Serves the files of the local driver. Public on purpose, like a bucket or CDN would be: an
 * `<img>` cannot send a token, and the keys carry a random uuid, so they cannot be guessed.
 * Not rate limited: one page can load dozens of photos.
 */
@Controller("media")
@Public()
@SkipThrottle()
export class MediaController {
  constructor(private readonly storage: LocalStorageService) {}

  @Get("*")
  async get(@Param("*") path: string, @Res() reply: FastifyReply) {
    const contentType = contentTypeOfKey(path);
    const file = contentType ? await this.storage.open(path) : null;
    if (!contentType || !file) throw new NotFoundException();

    return (
      reply
        .header("Content-Type", contentType)
        .header("Content-Length", file.size)
        // The key changes whenever the file does, so browsers and CDNs can keep it for good.
        .header("Cache-Control", "public, max-age=31536000, immutable")
        .header("Cross-Origin-Resource-Policy", "cross-origin")
        .send(file.stream)
    );
  }
}
