# Backend

The backend is a NestJS API in `apps/api`, in the same pnpm monorepo as the web app. It owns identity (see `docs/auth.md`) and all trip, expense and photo data. The `/api/*` contract is the one MSW already mocks in `apps/web/src/mocks`.

## Decisions

| Area         | Choice                                             | Why                                                                                                                                        |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework    | NestJS on the Fastify adapter                      | Modules per domain mirror `features/<domain>`. DI, guards and pipes give one pattern for the whole team.                                   |
| Language     | TypeScript strict                                  | Same as the web app.                                                                                                                       |
| Validation   | Zod through `nestjs-zod` (or a small pipe)         | The web schemas are the contract. `class-validator` would duplicate them.                                                                  |
| Contract     | `packages/shared` (`@bordo/shared`)                | Zod schemas and pure helpers used by web and api. One edit changes both sides.                                                             |
| Database     | PostgreSQL                                         | Transactions and integrity for financial data.                                                                                             |
| ORM          | Drizzle                                            | Schema-first types, close to SQL, no client generation step.                                                                               |
| Cache, queue | Redis (throttler storage, BullMQ)                  | Rate limits that hold across instances. Background e-mail jobs.                                                                            |
| Passwords    | Argon2id                                           | See `docs/auth.md`.                                                                                                                        |
| Logs         | pino                                               | Structured logs. Never log passwords, tokens or cookies.                                                                                   |
| Tests        | Vitest + supertest                                 | Same runner as the web app. Handler tests from MSW become API e2e cases.                                                                   |
| Hosting      | Containers on AWS (ECS Fargate) or GCP (Cloud Run) | Stateless service, configured by env. Managed Postgres (RDS or Cloud SQL), Redis (ElastiCache or Memorystore), object storage (S3 or GCS). |

Check the current official docs before adding or configuring any of these. Their APIs change.

## Monorepo layout

```
apps/
  web/              Next.js app
  api/              NestJS app
packages/
  shared/           @bordo/shared: Zod schemas + pure domain helpers
```

- `@bordo/shared` exposes one entry per domain: `@bordo/shared/trips`, `/expenses`, `/base-costs`, `/categories`, `/photos`, `/profile`, `/auth`, `/common`.
- It ships TypeScript source. The web app consumes it directly (Turbopack transpiles workspace packages). The API needs a way to run it too: either build the package (for example with `tsdown`) or compile the API with a bundler. Decide in phase 2, when the API gets a build.
- Keep it free of React, Node and browser APIs so both sides can import it.
- Zod stays on the same major version in every package (`zod` is a dependency of `@bordo/shared`, `apps/web` and `apps/api`).

## API structure

```
apps/api/src/
  main.ts
  app.module.ts
  common/            guards, filters, interceptors, pipes, decorators
  config/            env parsed with Zod, fails fast on boot
  database/          Drizzle schema, migrations, seed
  modules/
    auth/ profile/ trips/ expenses/ base-costs/ categories/ photos/
      <name>.controller.ts
      <name>.service.ts
      <name>.repository.ts
      <name>.module.ts
```

- Controllers parse input with the shared Zod schema and call the service. No business logic in controllers.
- Services hold the rules. Repositories are the only place that talks to Drizzle.
- Every response is parsed with the shared schema in tests, so the API cannot drift from what the web client expects.
- Money is an integer in cents plus an ISO currency code, in the database too (`integer`/`bigint` plus `char(3)`). Never `numeric` floats.
- Errors share one shape through a global exception filter. Validation errors map to `400` with field paths.
- Routes are prefixed with `/api`. Auth is a global guard; public routes opt out with `@Public()`.

## Security

Layers, outermost first:

1. **Edge.** CDN and WAF (CloudFront + AWS WAF, or Cloud Armor) absorb volumetric DDoS. The application cannot stop that kind of traffic.
2. **Global rate limit.** `@nestjs/throttler` `ThrottlerGuard` as a global guard, generous limit per IP, Redis storage so the count is shared by every instance. Too tight a limit blocks real users behind shared Wi-Fi or carrier NAT, common while travelling.
3. **Route limits.** Strict `@Throttle` on `sign-in`, `sign-up`, `forgot-password`, `reset-password` and the resend action, keyed by IP and by e-mail, as `docs/auth.md` requires.
4. **Headers.** Helmet (`@fastify/helmet`) for HSTS, `nosniff`, frame options and referrer policy. The API returns JSON, so CSP matters less than on the web app.
5. **Input.** Every body, query and param goes through a Zod pipe. Reject unknown keys. Require `Content-Type: application/json` on mutations.
6. **Sessions and cookies.** Opaque session id stored hashed, `HttpOnly; Secure; SameSite=Lax`, 30 days sliding (details in `docs/auth.md`).
7. **Proxy awareness.** The browser reaches the API through the Next rewrite and a load balancer. Configure Fastify `trustProxy` for exactly those hops, otherwise every request shares one IP and the throttler misbehaves.
8. **Secrets.** Environment variables loaded from the cloud secret manager. Nothing sensitive in the repo or in logs.
9. **Authorization.** Every query is scoped by the session user (a trip belongs to one user). Never trust ids from the path alone.

## Data model (starting point)

Auth tables are in `docs/auth.md` (`users`, `sessions`, `oauth_accounts`, `password_reset_tokens`). Domain tables:

- `trips(id, user_id, name, destination, start_date, end_date, currency, budget_cents, cover_photo_id, created_at)`
- `categories(id, user_id null, name, color, icon, hidden, created_at)` where `user_id` null means a default category
- `expenses(id, trip_id, kind DAILY|BASE, category_id, payment_method, amount_cents, currency, spent_at, description, created_at)`, with base costs being `kind = BASE`
- `photos(id, trip_id, storage_key, width, height, created_at)`

Final columns come from the shared schemas. Add indexes for `expenses(trip_id, spent_at)` and `trips(user_id)`.

## Endpoints

The surface is the one in `apps/web/src/mocks/handlers`: `auth`, `profile`, `categories`, `trips`, `trips/:tripId/expenses`, `trips/:tripId/base-costs`, `trips/:tripId/photos`, `trips/:tripId/cover`. The handler files are the spec while the API is built. Swagger is generated from the shared schemas once the API exists.

## Photos

Upload to object storage with pre-signed URLs. The API issues the URL and stores metadata; it does not proxy file bytes. Validate type and size when issuing the URL and again when confirming the upload.

## Jobs

BullMQ on Redis. First job: password recovery and e-mail change messages (template in the Pencil file). Retry with backoff, never block the request.

## Phases

1. **Monorepo foundation.** `apps/web`, `apps/api` (placeholder), `packages/shared` with the schemas extracted. Done: lint, typecheck, tests and build pass from the repo root.
2. **Nest core.** Env validation, Zod pipe, exception filter, Helmet, global throttler with Redis, `trustProxy`, health check, pino, Dockerfile, CI. Decide how `@bordo/shared` is built for the API.
3. **Database.** Drizzle schema and migrations, seed from the MSW fixtures, local Postgres and Redis through Docker Compose.
4. **Auth.** The endpoints in `docs/auth.md`, route-level throttling, Google sign-in with state and PKCE, reset e-mails through BullMQ.
5. **Domains.** In order: `profile`, `categories`, `trips`, `expenses` (with base costs), `photos`. Each one is covered by tests that reuse the MSW handler cases.
6. **Switch the web app.** Set `BACKEND_URL`, turn mocking off, handle `401` globally (checklist at the end of `docs/auth.md`).

## Conventions

- Commit scopes: `api` for the backend, `shared` for `packages/shared`, plus the existing domain scopes.
- Run `pnpm lint`, `pnpm typecheck` and `pnpm test` from the root before saying a task is done. Run `pnpm build` when routes, config or providers changed.
- A change to a schema in `packages/shared` must update the MSW handlers and fixtures in the same commit.
