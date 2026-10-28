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
- `categories(id, user_id, name, icon, color, kind, is_default, hidden, created_at)`, owned by a user (defaults are copied per user, see "Database")
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
3. **Database.** Code done, not yet run against a real Postgres (Docker was off). Drizzle schema and first migration, Nest provider, readiness check, seed from the MSW fixtures, Postgres in Docker Compose. See "Database" below.
4. **Auth.** In two parts.
   - **4a, done:** e-mail and password (sign-up, sign-in, sign-out, session, forgot and reset password), Argon2id, sessions, global auth guard with `@Public()`, strict rate limits that fail closed. See "Auth" below.
   - **4b, next:** Google sign-in with state and PKCE (and the `google_email` it needs), recovery e-mails through BullMQ with a real transport.
5. **Domains.** In order: `profile`, `categories`, `trips`, `expenses` (with base costs), `photos`. Each one is covered by tests that reuse the MSW handler cases.
   - **`profile`, done** (except photo and e-mail change, see "Profile").
   - **`categories`, done** (see "Categories"). Next: `trips`.
6. **Switch the web app.** Set `BACKEND_URL`, turn mocking off, handle `401` globally (checklist at the end of `docs/auth.md`).

### Left for last

Pieces that were postponed because they depend on infrastructure that comes later. Do them after the phases above, before or together with phase 6, and tick them here.

- [ ] **Google sign-in** (phase 4b): authorization code flow with state and PKCE, `email` column on `oauth_accounts` (fills `profile.googleEmail`, today always `null`), the `account-exists` rule, `GET /api/auth/google` and its callback.
- [ ] **Mail delivery** (phase 4b): BullMQ job and a real transport (Resend, SES or similar) behind `MailerService`. Until then the recovery link is only logged outside production.
- [ ] **Change e-mail**: `POST /api/profile/email-change` plus the confirmation endpoint and the web page that opens the link. Needs the mail delivery above. Until then the "Alterar" e-mail button of the profile fails against the real API.
- [ ] **Profile photo**: `PUT` and `DELETE /api/profile/photo`. Needs the object storage and upload validation of the `photos` module.
- [ ] **Profile total in other currencies**: `profile/stats` only adds expenses in the main currency. Decide the exchange rate source (provider, daily snapshot, or rate stored on each expense) and sum everything.
- [ ] **Swagger**, generated from the shared schemas once a few domains exist.

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

## Database

Decisions taken in phase 3:

- **Ids:** `uuid` with Postgres 18 `uuidv7()` as the default (time ordered, index friendly, no extension). The image is `postgres:18-alpine`.
- **Migrations:** SQL files generated by drizzle-kit into `apps/api/migrations`, applied by a **separate deploy step**, never on API boot (instances starting together would race). In the image: `node dist/database/migrate.js`. In compose, the `migrate` one-shot service runs it before `api`.
- **Names:** `casing: "snake_case"` in the Drizzle client and in `drizzle.config.ts`, so TypeScript stays camelCase and SQL snake_case.
- **Money:** `bigint` in number mode (cents) plus `char(3)`. Checks: amount > 0, budget >= 0, end date >= start date, color 1 to 8.
- **Users:** unique index on `lower(email)`. Sessions and reset tokens store only hashes.
- **Categories are per user.** Each account gets its own copy of the default categories at sign up (`src/database/default-categories.ts`, inserted with the user in one transaction), flagged `is_default`, with `hidden` on the row. This replaced the first idea (shared rows with `user_id` null plus a `hidden_categories` table): the app lets users edit and hide defaults, which a shared row cannot do per user. Migration `0001` converts existing data (copies per user, keeps what each user hid, repoints expenses). Changing the defaults list only affects new accounts.
- **Deleting a category** is `restrict` on `expenses.category_id`: the service moves the expenses first (`movedExpenses`), then deletes. For the same reason deleting a user removes their trips first (`ProfileRepository.deleteUser`): the cascade from the user would otherwise try to delete categories that expenses still reference.
- **Photos:** `storage_key` holds the object storage key. The seed stores the fixture URL there.

Code: `src/database/schema/` (`auth.ts`, `domain.ts`), `database.module.ts` (global `DATABASE` and `DATABASE_CLIENT` providers, `null` without `DATABASE_URL`, pool closed on shutdown), `migrate.ts`, `seed.ts`.

```bash
docker compose up -d postgres                       # needs Docker running
# uncomment DATABASE_URL in apps/api/.env
pnpm --filter @bordo/api db:migrate                 # apply migrations
pnpm --filter @bordo/api db:seed                    # dev data from the MSW fixtures (empties the tables first)
pnpm --filter @bordo/api db:generate -- --name=x    # after changing the schema, then commit the SQL
curl localhost:3001/api/health/ready                # database: up
```

The seed loads `apps/web/src/mocks/fixtures` at runtime and parses them with the shared schemas, so the API has no compile time dependency on the web app. It refuses to run with `NODE_ENV=production`.

## Auth

Contract in `docs/auth.md`. How the API implements it (`src/modules/auth`):

- **Sessions:** the cookie `bordo_session` holds 256 random bits. Only its SHA-256 is stored (`sessions.id_hash`). `HttpOnly; SameSite=Lax; Path=/`, `Secure` in production, 30 days sliding: the expiry and the cookie are renewed when the last refresh is more than a day old.
- **Passwords:** Argon2id through `@node-rs/argon2` (prebuilt binaries, no compiler in the image), library defaults (19 MiB, 2 passes). A wrong password, an unknown e-mail and a Google-only account all answer the same `401`, and the unknown case spends the same hashing time.
- **Guard:** `AuthGuard` is global and runs last. Routes opt out with `@Public()` (health, sign-up, sign-in, sign-out, forgot and reset). `@CurrentUser()` gives the user to the handler.
- **Rate limits** (`StrictRateLimiter`, Redis, in memory without it): sign-in 20 per IP and 5 per e-mail in 15 min; sign-up and forgot password 10 per IP and 3 per e-mail per hour; reset 10 per IP per hour. E-mails are hashed in the keys. Unlike the global limit this one **fails closed**: if Redis breaks, the route answers `503`.
- **Recovery:** one live link per account (a new request replaces the old), token stored hashed, 1 hour, single use (a conditional update makes it safe under concurrent requests). Resetting ends every session of the account. Google-only accounts can use it to add a password.
- **E-mail:** `MailerService` has no provider yet. Outside production it logs the link; in production it logs nothing and warns. BullMQ and a real transport are phase 4b.
- Validation errors are `400` with field paths (the MSW mocks answer `422`; the web client treats any 4xx as a failure, so this is fine).
- Known gap: `profile.googleEmail` is always `null` until the Google flow stores the connected account's e-mail.

Tests (`test/auth.test.ts`) run against a real Postgres: `globalSetup` creates `bordo_test` on the compose Postgres and migrates it. Without a reachable Postgres they are skipped locally; CI sets `REQUIRE_DATABASE=1` and has a Postgres service, so a missing database fails there.

## Profile

`src/modules/profile`. All routes need a session and only touch the signed-in user's data.

| Route                              | Notes                                                                                                                                                                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/profile`                 | The session user, in the shared `profileSchema` shape.                                                                                                                                                                                       |
| `PATCH /api/profile`               | `name` and main `currency` only (`updateProfileSchema`). Unknown fields are dropped.                                                                                                                                                         |
| `GET /api/profile/stats`           | Trips, days traveled (both ends counted), distinct destinations (case and space insensitive) and the total. See below.                                                                                                                       |
| `GET /api/profile/export`          | CSV of every expense, same columns as the mock. UTF-8 with BOM, `no-store`. Amounts use the currency's decimals (`980.00` EUR, `4500` JPY). Cells that start with `=`, `+`, `-`, `@` get a leading quote so a spreadsheet does not run them. |
| `POST /api/profile/password-reset` | Same single use link as recovery, sent to the signed-in user (also how a Google-only account adds a password). 3 per hour per account.                                                                                                       |
| `DELETE /api/profile`              | Deletes the user, cascading to sessions, trips, expenses, photos and own categories, and clears the cookie.                                                                                                                                  |

Not built yet, on purpose:

- `PUT` and `DELETE /api/profile/photo`: need object storage, they come with `photos`.
- `POST /api/profile/email-change`: needs the confirmation endpoint and a real mail transport (phase 4b).

`totalInCents` adds only the expenses made in the profile's main currency. There is no exchange rate source, and adding euros to reais would be wrong. When trips in other currencies matter here, rates become a decision (provider, daily snapshot or rate at the time of the expense).

## Categories

`src/modules/categories`. Every query is scoped by the session user: another user's category id answers `404`, and ids must be uuids (`400` otherwise).

| Route                            | Notes                                                                                                                                                                                                                         |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/categories`            | The user's categories: daily first, then in creation order (defaults first, ids are time ordered).                                                                                                                            |
| `POST /api/categories`           | `name`, `icon`, `color`, `kind`. Always a custom category: `isDefault`, `hidden` and owner come from the server.                                                                                                              |
| `PUT /api/categories/:id`        | `name`, `icon`, `color`. Works on defaults too (they are the user's own copy). The kind never changes.                                                                                                                        |
| `PUT /api/categories/:id/hidden` | `{ hidden }`. Hidden categories are not offered for new expenses; existing expenses keep them.                                                                                                                                |
| `DELETE /api/categories/:id`     | `409` for a default. If expenses use it, `?moveTo=<id>` is required and must be another category of the same kind owned by the user (`422` otherwise). Moves and deletes in one transaction, answers `{ id, movedExpenses }`. |

Not enforced yet: duplicate names (the contract does not ask for it) and a cap on how many custom categories an account can have.

Dev databases created before this change need `pnpm --filter @bordo/api db:migrate`; the migration converts their data.

## Environment

Validated with Zod at boot (`src/config/env.ts`). The process exits with every problem listed. A `.env` file in `apps/api` is read outside production; real variables win.

| Variable            | Default                 | Notes                                                                                        |
| ------------------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| `NODE_ENV`          | `development`           | `production` turns off pretty logs and makes `REDIS_URL` mandatory                           |
| `PORT`, `HOST`      | `3001`, `0.0.0.0`       |                                                                                              |
| `LOG_LEVEL`         | `info`                  | `silent` in tests                                                                            |
| `REDIS_URL`         | none                    | Rate limit storage and readiness check. Without it the limit is in memory (one process only) |
| `DATABASE_URL`      | none                    | Postgres connection string. Optional in development and tests, mandatory in production       |
| `DATABASE_POOL_MAX` | `10`                    | Connections per API instance                                                                 |
| `WEB_URL`           | `http://localhost:3000` | Public web address, used in e-mailed links                                                   |
| `TRUST_PROXY`       | none                    | Addresses or CIDRs of the proxies in front of the API, comma separated. Never a number       |
| `THROTTLE_TTL_MS`   | `60000`                 | Window of the global limit                                                                   |
| `THROTTLE_LIMIT`    | `120`                   | Requests per window per client IP                                                            |

## What is in place

- `GET /api/health` (liveness, never rate limited, not logged) and `GET /api/health/ready` (checks Redis, `503` with the failing dependency when down).
- Every error has the same shape: `{ statusCode, error, message, issues?, requestId }`. Unexpected errors never leak their message. Validation errors list the failing `path` of each field, with the pt-BR messages from the shared schemas.
- `x-request-id` is kept when the caller sends a sane one, generated otherwise, and shows up in the header, the logs and the error body.
- The global limit is a guard that fails open: if Redis breaks, traffic keeps flowing and the failure is logged. Sign-in and the other sensitive routes must not fail open, so phase 4 gives them their own strict guard.
- Mutations with a body must send `application/json` (`415` otherwise).
- Logs are JSON in production and pretty in development. `authorization`, `cookie` and `set-cookie` are redacted.
- `GET /api/health/ready` also checks Postgres (`select 1`).
- Every route except health and the public auth routes needs a session (global `AuthGuard`).
- Not done yet, by design: Google sign-in and e-mail delivery (phase 4b), Swagger (after the first domain).

## Where we stopped

Last updated 2026-10-28. Phases 1 to 3 are merged into `main` (PRs #1 and #2). Phase 4a (e-mail and password auth) is written on the branch `feat/auth`, with tests against a real Postgres, and was smoke tested in the production container (migrate, sign-up, session, sign-out, health). Not committed or in a PR yet.

### Next

1. Commit and PR for `feat/auth`.
2. Phase 4b: Google sign-in (state and PKCE, `google_email` column on `oauth_accounts`, the `account-exists` rule), BullMQ job and a mail provider for the recovery e-mail.
3. Phase 5: domains, starting with `profile`.

### Gotchas learned

- `ConfigModule` ignores `.env` on purpose (`config/load-env.ts` loads it in `main.ts`). Reading it in the module as well leaked a developer's local file into the tests.

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
