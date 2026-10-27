import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  Logger,
  ServiceUnavailableException,
} from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { STATUS_CODES } from "node:http";
import { ZodValidationException } from "nestjs-zod";

export interface ErrorIssue {
  path: string;
  message: string;
}

export interface ErrorBody {
  statusCode: number;
  error: string;
  message: string;
  issues?: ErrorIssue[];
  requestId?: string;
}

interface ZodIssueLike {
  path: PropertyKey[];
  message: string;
}

function isZodErrorLike(value: unknown): value is { issues: ZodIssueLike[] } {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { issues?: unknown }).issues)
  );
}

function toIssues(exception: ZodValidationException): ErrorIssue[] {
  const error = exception.getZodError();
  if (!isZodErrorLike(error)) return [];
  return error.issues.map((issue) => ({
    path: issue.path.map(String).join("."),
    message: issue.message,
  }));
}

/** Terminus answers an unhealthy check with its own body, which says which dependency is down. */
function isHealthResult(response: unknown): response is Record<string, unknown> {
  return (
    typeof response === "object" &&
    response !== null &&
    (response as { status?: unknown }).status === "error" &&
    "details" in response
  );
}

function messageOf(exception: HttpException): string {
  const response = exception.getResponse();
  if (typeof response === "string") return response;
  const message = (response as { message?: string | string[] }).message;
  if (Array.isArray(message)) return message.join("; ");
  return message ?? exception.message;
}

/** One error shape for every failure. Unknown errors never leak their message. */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const { httpAdapter } = this.httpAdapterHost;
    const context = host.switchToHttp();
    const requestId = context.getRequest<{ id?: string }>().id;

    if (
      exception instanceof ServiceUnavailableException &&
      isHealthResult(exception.getResponse())
    ) {
      httpAdapter.reply(context.getResponse(), exception.getResponse(), 503);
      return;
    }

    let body: ErrorBody;
    if (exception instanceof ZodValidationException) {
      body = {
        statusCode: 400,
        error: STATUS_CODES[400]!,
        message: "Validation failed",
        issues: toIssues(exception),
      };
    } else if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      body = {
        statusCode,
        error: STATUS_CODES[statusCode] ?? "Error",
        message: messageOf(exception),
      };
      if (statusCode >= 500) this.logger.error(exception.stack);
    } else {
      this.logger.error(
        exception instanceof Error ? (exception.stack ?? exception.message) : String(exception),
      );
      body = { statusCode: 500, error: STATUS_CODES[500]!, message: "Internal server error" };
    }

    if (requestId) body.requestId = requestId;
    httpAdapter.reply(context.getResponse(), body, body.statusCode);
  }
}
