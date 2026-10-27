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
- Two ways to consume it, one source of truth:
  - **Web** reads the TypeScript source directly through a `paths` alias in `apps/web/tsconfig.json` (`@bordo/shared/*` to `packages/shared/src/*`). No build step, instant HMR.
  - **API** (ESM, Node) needs real JavaScript. `pnpm --filter @bordo/shared build` runs `tsdown`, which bundles one ESM file plus types per domain into `dist/` and keeps the `exports` map of `package.json` in sync. The API's `predev`, `pretest` and `pretypecheck` scripts run that build for you.
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
2. **Nest core.** Done. Env validation, Zod pipe, exception filter, Helmet, global throttler with Redis, `trustProxy`, health check, pino, Dockerfile, compose and CI. See "Running the API" below.
3. **Database.** Drizzle schema and migrations, seed from the MSW fixtures, local Postgres and Redis through Docker Compose.
4. **Auth.** The endpoints in `docs/auth.md`, route-level throttling, Google sign-in with state and PKCE, reset e-mails through BullMQ.
5. **Domains.** In order: `profile`, `categories`, `trips`, `expenses` (with base costs), `photos`. Each one is covered by tests that reuse the MSW handler cases.
6. **Switch the web app.** Set `BACKEND_URL`, turn mocking off, handle `401` globally (checklist at the end of `docs/auth.md`).

## Running the API

```bash
pnpm install
cp apps/api/.env.example apps/api/.env     # optional, every variable has a default in development
pnpm dev:api                               # http://localhost:3001/api/health
```

With the shared rate limit storage (Redis):

```bash
docker compose up -d redis                 # needs Docker (Docker Desktop or OrbStack) running
# uncomment REDIS_URL in apps/api/.env, then
pnpm dev:api
curl localhost:3001/api/health/ready       # redis: up
```

The production image, as it runs in the cloud (`NODE_ENV=production`, Redis required):

```bash
docker compose --profile api up --build    # API on http://localhost:3001
```

Quick manual checks:

```bash
curl -i localhost:3001/api/health          # Helmet headers + x-request-id
curl -i localhost:3001/api/nope            # 404 in the standard error shape
```

The global rate limit has no route to try by hand yet: guards do not run on unknown paths and health is exempt. The tests cover it (limit, `429` shape, `trustProxy`, fail open) and the first real route (phase 4) can be hit with `THROTTLE_LIMIT=3`.

Tests: `pnpm --filter @bordo/api test`. They run the real app through `app.inject` (no network, no Redis needed) and cover health, Helmet, the error shape, Zod validation with a schema from `@bordo/shared`, the JSON content type guard, the global limit, `trustProxy` and the limiter failing open.

## Environment

Validated with Zod at boot (`src/config/env.ts`). The process exits with every problem listed. A `.env` file in `apps/api` is read outside production; real variables win.

| Variable          | Default           | Notes                                                                                        |
| ----------------- | ----------------- | -------------------------------------------------------------------------------------------- |
| `NODE_ENV`        | `development`     | `production` turns off pretty logs and makes `REDIS_URL` mandatory                           |
| `PORT`, `HOST`    | `3001`, `0.0.0.0` |                                                                                              |
| `LOG_LEVEL`       | `info`            | `silent` in tests                                                                            |
| `REDIS_URL`       | none              | Rate limit storage and readiness check. Without it the limit is in memory (one process only) |
| `TRUST_PROXY`     | none              | Addresses or CIDRs of the proxies in front of the API, comma separated. Never a number       |
| `THROTTLE_TTL_MS` | `60000`           | Window of the global limit                                                                   |
| `THROTTLE_LIMIT`  | `120`             | Requests per window per client IP                                                            |

## What is in place

- `GET /api/health` (liveness, never rate limited, not logged) and `GET /api/health/ready` (checks Redis, `503` with the failing dependency when down).
- Every error has the same shape: `{ statusCode, error, message, issues?, requestId }`. Unexpected errors never leak their message. Validation errors list the failing `path` of each field, with the pt-BR messages from the shared schemas.
- `x-request-id` is kept when the caller sends a sane one, generated otherwise, and shows up in the header, the logs and the error body.
- The global limit is a guard that fails open: if Redis breaks, traffic keeps flowing and the failure is logged. Sign-in and the other sensitive routes must not fail open, so phase 4 gives them their own strict guard.
- Mutations with a body must send `application/json` (`415` otherwise).
- Logs are JSON in production and pretty in development. `authorization`, `cookie` and `set-cookie` are redacted.
- Not done yet, by design: auth guard and `@Public()` (phase 4), database (phase 3), Swagger (after the first domain).

## Where we stopped

Last updated 2026-10-27. Phases 1 and 2 are done and committed on the branch `chore/monorepo` (not pushed, no PR yet). Next is phase 3.

### Still to verify (needs Docker or GitHub)

- [ ] `docker compose up -d redis`, set `REDIS_URL`, and confirm `GET /api/health/ready` reports `redis: up`. The Redis rate limit storage has only been exercised against a dead Redis so far.
- [ ] `docker build -f apps/api/Dockerfile -t bordo-api .` and `docker compose --profile api up --build`. Only the pnpm steps and the deployed artifact were run by hand.
- [ ] First run of `.github/workflows/ci.yml` after pushing.
- [ ] Open the PR for `chore/monorepo` and merge it before starting phase 3.

### Phase 3 plan (database)

1. Check the current Drizzle docs (Context7) before installing: `drizzle-orm`, `drizzle-kit`, and the Postgres driver (`postgres` or `pg`).
2. Add a `postgres` service to `compose.yaml` with a healthcheck, and `DATABASE_URL` to the env schema (`src/config/env.ts`, required in production) and to `.env.example`.
3. Create `src/database/` with a Nest provider for the Drizzle client (closed on shutdown), the schema, migrations and a seed script built from `apps/web/src/mocks/fixtures`.
4. Schema first for auth (`users`, `sessions`, `oauth_accounts`, `password_reset_tokens`), then the domain tables listed under "Data model". Money stays integer cents plus a 3 letter currency code.
5. Add a Postgres health indicator next to `RedisHealthIndicator` in `/api/health/ready`.
6. Integration tests against a real Postgres (compose or a CI service container). Decide whether the API test suite starts its own database.

Open decisions for phase 3: id strategy (uuid v7 or bigint), Postgres version, and whether migrations run on boot or as a separate deploy step (recommended: separate step).

### Phase 4 reminders (auth)

- Give sign-in, sign-up, forgot and reset password a strict guard that **fails closed** (the global one fails open), keyed by IP and by e-mail.
- Add the global auth guard and the `@Public()` decorator. Health stays public.
- Argon2id needs a native build: check the prebuilt binaries for `node:22-slim` in the Dockerfile.
- The first real route also allows trying the rate limit by hand with `THROTTLE_LIMIT=3`.

### Gotchas learned

- Node is not on the PATH in some shells (nvm not loaded). Use Node 22: `export PATH=$HOME/.nvm/versions/node/v22.21.0/bin:$PATH`.
- API source is ESM under `nodenext`: relative imports need the `.js` extension.
- `ConfigModule.forRoot` validates the environment when `app.module.ts` is imported. Tests therefore call `vi.resetModules()` and import the app fresh for each env (`test/helpers/create-test-app.ts`).
- Guards do not run on routes that do not exist, so a `404` is never rate limited.
- pnpm 10 needs `pnpm deploy --legacy` (already in the Dockerfile).
- `nestjs-zod` and `@nest-lab/throttler-storage-redis` do not declare Nest 12 peers yet. They are allowed in `pnpm-workspace.yaml` under `peerDependencyRules`. Remove those entries when they publish support.
- `ioredis` is pinned to the 5.x line, which is what the Redis throttler storage was tested with.
- Without `NODE_ENV=production` the API uses `pino-pretty`, a dev dependency that is not in the image. The Dockerfile sets `NODE_ENV=production`.

## Conventions

- Commit scopes: `api` for the backend, `shared` for `packages/shared`, plus the existing domain scopes.
- Run `pnpm lint`, `pnpm typecheck` and `pnpm test` from the root before saying a task is done. Run `pnpm build` when routes, config or providers changed.
- A change to a schema in `packages/shared` must update the MSW handlers and fixtures in the same commit.
