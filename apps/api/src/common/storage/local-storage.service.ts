import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import type { Readable } from "node:stream";

import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import type { Env } from "../../config/env.js";
import { isStorageKey } from "./storage-key.js";
import { StorageService } from "./storage.service.js";

/**
 * Files in a folder, for development and single machine setups. Served back by the media route.
 * The S3 compatible driver (AWS S3, Cloudflare R2...) replaces it in the cloud and the files are
 * then served by the bucket or a CDN, not by the API.
 */
@Injectable()
export class LocalStorageService extends StorageService {
  private readonly root: string;

  constructor(@Inject(ConfigService) config: ConfigService<Env, true>) {
    super();
    this.root = resolve(config.get("STORAGE_LOCAL_DIR", { infer: true }));
  }

  /** Absolute path of a key, or null when it is not a key this app creates (no `..`, no surprises). */
  private pathOf(key: string): string | null {
    if (!isStorageKey(key)) return null;
    const path = resolve(this.root, key);
    return path.startsWith(this.root + sep) ? path : null;
  }

  async put(key: string, body: Buffer) {
    const path = this.pathOf(key);
    if (!path) throw new Error(`Invalid storage key: ${key}`);
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, body);
  }

  async delete(key: string) {
    const path = this.pathOf(key);
    if (path) await rm(path, { force: true });
  }

  /** For the media route: a read stream and the size, or null when there is no such file. */
  async open(key: string): Promise<{ stream: Readable; size: number } | null> {
    const path = this.pathOf(key);
    if (!path) return null;
    try {
      const info = await stat(path);
      return info.isFile() ? { stream: createReadStream(path), size: info.size } : null;
    } catch {
      return null;
    }
  }
}
