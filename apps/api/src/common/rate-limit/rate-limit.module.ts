import { Global, Module } from "@nestjs/common";

import { StrictRateLimiter } from "./strict-rate-limiter.js";

@Global()
@Module({ providers: [StrictRateLimiter], exports: [StrictRateLimiter] })
export class RateLimitModule {}
