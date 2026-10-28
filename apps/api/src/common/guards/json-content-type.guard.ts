import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { FastifyRequest } from "fastify";

import { ALLOW_MULTIPART } from "../../modules/auth/allow-multipart.decorator.js";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Requests that carry a body must declare `application/json`. Browsers cannot send that type
 * cross-site without a CORS preflight, which is what lets SameSite=Lax cookies cover CSRF.
 */
@Injectable()
export class JsonContentTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (!MUTATING_METHODS.has(request.method)) return true;

    const hasBody =
      request.headers["transfer-encoding"] !== undefined ||
      Number(request.headers["content-length"] ?? 0) > 0;
    if (!hasBody) return true;

    const contentType = (request.headers["content-type"] ?? "").split(";")[0]?.trim().toLowerCase();
    // Upload routes opt in to multipart; SameSite=Lax cookies still keep cross-site forms out.
    const allowsMultipart = this.reflector.getAllAndOverride<boolean>(ALLOW_MULTIPART, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (allowsMultipart && contentType === "multipart/form-data") return true;

    if (contentType !== "application/json") {
      throw new HttpException(
        "Content-Type must be application/json",
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }
    return true;
  }
}
