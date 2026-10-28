import { Body, Controller, Get, Post } from "@nestjs/common";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { Test, type TestingModuleBuilder } from "@nestjs/testing";
import { vi } from "vitest";
import { signInSchema } from "@bordo/shared/auth";
import { Public } from "../../src/modules/auth/public.decorator.js";
import { createZodDto } from "nestjs-zod";
import { z } from "zod";

class EchoDto extends createZodDto(
  z.object({ name: z.string().min(2), age: z.number().int().optional() }),
) {}

class SignInDto extends createZodDto(signInSchema) {}

/** Routes that only exist in tests, to exercise pipes, guards and the exception filter. */
@Public()
@Controller("test")
class TestController {
  @Post("echo")
  echo(@Body() body: EchoDto) {
    return body;
  }

  @Post("sign-in")
  signIn(@Body() body: SignInDto) {
    return { email: body.email };
  }

  @Post("empty")
  empty() {
    return { ok: true };
  }

  @Get("ping")
  ping() {
    return { ok: true };
  }

  @Get("boom")
  boom() {
    throw new Error("secret internal detail");
  }
}

const baseEnv = { NODE_ENV: "test", LOG_LEVEL: "silent" };

export async function createTestApp(
  env: Record<string, string> = {},
  customize: (builder: TestingModuleBuilder) => TestingModuleBuilder = (builder) => builder,
) {
  // ConfigModule validates process.env when AppModule is imported, so set it and import fresh each time.
  for (const key of [
    "REDIS_URL",
    "DATABASE_URL",
    "TRUST_PROXY",
    "THROTTLE_LIMIT",
    "THROTTLE_TTL_MS",
  ])
    delete process.env[key];
  Object.assign(process.env, baseEnv, env);
  vi.resetModules();
  const { AppModule } = await import("../../src/app.module.js");
  const { configureApp } = await import("../../src/common/http/configure-app.js");
  const { createAdapter } = await import("../../src/common/http/create-adapter.js");

  const builder = Test.createTestingModule({ imports: [AppModule], controllers: [TestController] });
  const moduleRef = await customize(builder).compile();

  const app = moduleRef.createNestApplication<NestFastifyApplication>(
    createAdapter(env.TRUST_PROXY),
    {
      bufferLogs: true,
    },
  );
  await configureApp(app);
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  return app;
}
