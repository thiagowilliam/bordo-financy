import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import type { FastifyRequest } from "fastify";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Requests that carry a body must declare `application/json`. Browsers cannot send that type
 * cross-site without a CORS preflight, which is what lets SameSite=Lax cookies cover CSRF.
 */
@Injectable()
export class JsonContentTypeGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<FastifyRequest>();
    if (!MUTATING_METHODS.has(request.method)) return true;

    const hasBody =
      request.headers["transfer-encoding"] !== undefined ||
      Number(request.headers["content-length"] ?? 0) > 0;
    if (!hasBody) return true;

    const contentType = (request.headers["content-type"] ?? "").split(";")[0]?.trim().toLowerCase();
    if (contentType !== "application/json") {
      throw new HttpException(
        "Content-Type must be application/json",
        HttpStatus.UNSUPPORTED_MEDIA_TYPE,
      );
    }
    return true;
  }
}
