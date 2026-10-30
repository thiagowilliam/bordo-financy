import "reflect-metadata";
import "./config/load-env.js";

import { NestFactory } from "@nestjs/core";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";

import { AppModule } from "./app.module.js";
import { configureApp } from "./common/http/configure-app.js";
import { configureSwagger } from "./common/http/configure-swagger.js";
import { createAdapter } from "./common/http/create-adapter.js";
import { validateEnv } from "./config/env.js";

async function bootstrap() {
  // Validate before building the app so a bad environment fails with one clear message.
  const env = validateEnv(process.env);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    createAdapter(env.TRUST_PROXY),
    {
      bufferLogs: true,
    },
  );
  await configureApp(app);
  if (env.SWAGGER_ENABLED ?? env.NODE_ENV !== "production") configureSwagger(app);
  await app.listen(env.PORT, env.HOST);
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
