import { HttpException, Injectable, Logger } from "@nestjs/common";
import { ThrottlerGuard, type ThrottlerRequest } from "@nestjs/throttler";

/**
 * Global rate limit that keeps serving traffic when the limiter's storage (Redis) fails.
 * Limit violations (HTTP errors) still pass through. Routes that must never fail open, such as
 * sign-in, should use a stricter guard of their own.
 */
@Injectable()
export class SafeThrottlerGuard extends ThrottlerGuard {
  private readonly limiterLogger = new Logger(SafeThrottlerGuard.name);

  protected override async handleRequest(requestProps: ThrottlerRequest): Promise<boolean> {
    try {
      return await super.handleRequest(requestProps);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.limiterLogger.error(`Rate limit storage failed, allowing the request: ${String(error)}`);
      return true;
    }
  }
}
