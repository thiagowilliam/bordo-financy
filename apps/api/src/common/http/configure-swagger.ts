import type { NestFastifyApplication } from "@nestjs/platform-fastify";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";

import { SESSION_COOKIE } from "../../modules/auth/auth.constants.js";

export const DOCS_PATH = "docs";

/** The OpenAPI document, built from the routes and the shared Zod schemas. */
export function buildOpenApiDocument(app: NestFastifyApplication) {
  const config = new DocumentBuilder()
    .setTitle("Bordo API")
    .setDescription(
      "API of Bordo, the travel finance diary. The session is an httpOnly cookie set on sign in (`POST /auth/sign-in`); this page sends it along once you have signed in from the same browser.",
    )
    .setVersion("1.0")
    .addCookieAuth(SESSION_COOKIE)
    .build();
  return cleanupOpenApiDoc(SwaggerModule.createDocument(app, config));
}

/** Swagger UI at `/api/docs` and the JSON at `/api/docs-json`. */
export function configureSwagger(app: NestFastifyApplication) {
  SwaggerModule.setup(DOCS_PATH, app, buildOpenApiDocument(app), {
    useGlobalPrefix: true,
    customSiteTitle: "Bordo API",
  });
}
