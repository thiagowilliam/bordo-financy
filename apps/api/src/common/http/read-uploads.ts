import { PayloadTooLargeException, UnprocessableEntityException } from "@nestjs/common";
import type { FastifyRequest } from "fastify";

export interface Upload {
  /** The name the user's device gave the file, cleaned for display. */
  name: string;
  data: Buffer;
}

/** Display name: no path, no control characters, bounded. */
export function cleanFileName(raw: string | undefined): string {
  const base = (raw ?? "").split(/[\\/]/).pop() ?? "";
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 120);
  return cleaned || "foto";
}

/**
 * Reads the files of a multipart request that are sent under `field`. Other fields and files are
 * drained and ignored. Throws `413` over `maxBytes` per file, and `422` when there are none or more
 * than `maxFiles`.
 */
export async function readUploads(
  request: FastifyRequest,
  field: string,
  { maxFiles, maxBytes }: { maxFiles: number; maxBytes: number },
): Promise<Upload[]> {
  if (!request.isMultipart()) {
    throw new UnprocessableEntityException("Envie as imagens como multipart/form-data.");
  }

  const uploads: Upload[] = [];
  try {
    for await (const part of request.parts({
      limits: { fileSize: maxBytes, files: maxFiles + 1 },
    })) {
      if (part.type !== "file") continue;
      const data = await part.toBuffer();
      if (part.fieldname !== field || data.length === 0) continue;
      uploads.push({ name: cleanFileName(part.filename), data });
      if (uploads.length > maxFiles) break;
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === "FST_REQ_FILE_TOO_LARGE") {
      throw new PayloadTooLargeException("Arquivo maior que o limite permitido.");
    }
    if (code === "FST_FILES_LIMIT") {
      throw new UnprocessableEntityException("Arquivos demais.");
    }
    throw error;
  }

  if (uploads.length === 0) throw new UnprocessableEntityException("Nenhuma imagem enviada.");
  if (uploads.length > maxFiles) {
    throw new UnprocessableEntityException(`Envie no máximo ${maxFiles} imagens por vez.`);
  }
  return uploads;
}
