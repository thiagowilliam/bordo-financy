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

## Photos and storage

See "Photos" below for the routes. How files are stored:

- **Behind an interface.** `StorageService` (`put`, `delete`) is the only thing the modules know. Today the driver is `local`, a folder on disk (`STORAGE_LOCAL_DIR`). An S3 compatible driver is the next one: AWS S3, or Cloudflare R2 (R2 is Cloudflare's, not AWS, but it speaks the S3 API, so the same driver and SDK serve both; only endpoint, credentials and the public address change).
- **Keys** are `trips/<tripId>/<uuid>.<ext>` and `avatars/<userId>/<uuid>.<ext>`. The random part makes URLs unguessable, which is what lets the files be public like a bucket or CDN would be. Only keys of that shape are accepted by the disk driver, which is what keeps path traversal out.
- **URLs.** The database stores the key; the API turns it into a URL with `MEDIA_BASE_URL` (default `/api/media`, served by the API itself). With a bucket, set it to the bucket or CDN address and the same rows keep working. Absolute URLs already stored (a Google profile photo, the dev seed) are returned as they are.
- **Uploads go through the API** as `multipart/form-data` (this is what the web client already sends), not through pre-signed URLs, which the first plan assumed. The API is the place that can check what the file really is. Pre-signed uploads can come later as an optimization if the size or traffic asks for it, at the price of a new contract and a confirm step.
- **Every upload is decoded and written again** (`ImageService`, sharp): the declared type is not trusted, only JPEG, PNG (and WEBP for the profile photo) pass, decompression bombs are refused (50 MP), the image is turned upright and shrunk to 2560 px on the long side, and metadata is dropped, which for a travel photo includes the GPS position. Width and height go to the database.
- **Local disk in containers is ephemeral.** `compose.yaml` mounts a volume at `/app/storage`. On ECS Fargate or Cloud Run use the S3 compatible driver instead (a task's disk does not survive).

## Mail

`src/modules/mail`. Account e-mails go through a BullMQ queue on Redis and leave through SMTP.

- **Callers** use `MailerService` (`sendPasswordReset`, `sendEmailChange`, `sendEmailChanged`). Each one only queues a job and never throws: the request that asked for the e-mail returns at once.
- **Queue and worker** (`MailQueue`): queue `mail`, prefix `QUEUE_PREFIX` (default `bordo`). 5 attempts with exponential backoff starting at `MAIL_RETRY_DELAY_MS` (10 s). Finished jobs are removed immediately, so the e-mailed links do not stay in Redis; failed ones are kept for an hour (the links last an hour). The worker runs inside the API process (`MAIL_WORKER=false` turns it off to run it elsewhere). The job payload is validated again by the worker.
- **Without Redis** (development) e-mails are sent inline. If Redis is down or slow when a job is queued, the e-mail is sent directly instead of being lost (an unlikely duplicate is the price). On shutdown the worker gets 3 seconds to finish, then the connections are cut, so a dead Redis cannot keep the process from exiting.
- **Transport** (`MailTransport`): `SmtpTransport` (nodemailer) when `MAIL_SMTP_URL` is set, otherwise `LogTransport`, which prints the message (and its link) in the API log. Production requires `MAIL_SMTP_URL` and `MAIL_FROM`, so the log transport never runs there and a token never reaches production logs. Logs mask the address (`m***@gmail.com`).
- **Templates** (`mail.templates.ts`): the layout of the "E-mail · Recuperação de senha" design (600 px, sand page, white card, coral button), table based with inline styles and a plain text version. Everything dynamic is HTML escaped. Three messages: password recovery, change of e-mail (to the new address), and a notice to the old address after the change.
- **Development inbox:** `docker compose up -d mailpit redis`, set `MAIL_SMTP_URL=smtp://localhost:1025` in `apps/api/.env`, and read the messages at http://localhost:8025. Nothing leaves your machine.

### Sending real e-mail (production)

Any provider with SMTP works, the code does not change. The steps that need a person:

1. Have a domain and access to its DNS.
2. Create an account at the provider, add the domain, and publish the DNS records it shows (SPF, DKIM and, recommended, DMARC). Wait for it to say verified.
   - **Resend:** API Keys, a key with sending access. `MAIL_SMTP_URL=smtps://resend:API_KEY@smtp.resend.com:465`.
   - **Amazon SES:** pick the region, create the domain identity (DKIM records), **request production access** (in the sandbox it only sends to verified addresses), create SMTP credentials. `MAIL_SMTP_URL=smtps://SMTP_USER:SMTP_PASSWORD@email-smtp.<region>.amazonaws.com:465`.
3. `MAIL_FROM="Bordo <nao-responda@yourdomain.com>"`, on the verified domain.
4. Put both in the secret manager (never in the repo or in logs). In development they go in `apps/api/.env`.
5. Send a recovery e-mail to a real inbox and check where it lands (inbox or spam).

Open points: the notice sent to the old address says to contact "o suporte do Bordo", but there is no support address yet; define one and put it in that template. Sign-up does not send a verification e-mail (the contract does not ask for it), so `emailVerified` only becomes true through an e-mail change or Google.

## Phases

1. **Monorepo foundation.** `apps/web`, `apps/api` (placeholder), `packages/shared` with the schemas extracted. Done: lint, typecheck, tests and build pass from the repo root.
2. **Nest core.** Done. Env validation, Zod pipe, exception filter, Helmet, global throttler with Redis, `trustProxy`, health check, pino, Dockerfile, compose and CI. See "Running the API" below.
3. **Database.** Code done, not yet run against a real Postgres (Docker was off). Drizzle schema and first migration, Nest provider, readiness check, seed from the MSW fixtures, Postgres in Docker Compose. See "Database" below.
4. **Auth.** In two parts.
   - **4a, done:** e-mail and password (sign-up, sign-in, sign-out, session, forgot and reset password), Argon2id, sessions, global auth guard with `@Public()`, strict rate limits that fail closed. See "Auth" below.
   - **4b, part 1 done:** mail delivery (BullMQ queue and SMTP transport, see "Mail") and the change of e-mail. **4b, part 2 done:** Google sign-in (see "Google sign-in" below).
5. **Domains.** In order: `profile`, `categories`, `trips`, `expenses` (with base costs), `photos`. Each one is covered by tests that reuse the MSW handler cases.
   - **`profile`, done** (except photo and e-mail change, see "Profile").
   - **`categories`, done** (see "Categories").
   - **`trips`, done** (see "Trips").
   - **`expenses` and base costs, done** (see "Expenses").
   - **`photos`, done** (see "Photos"), including the profile photo. Phase 5 is complete.
6. **Switch the web app.** Done (see "Web app against the API"): the real API is the default, the mocks are opt-in, the session is read on the server, a `401` goes to sign in, and a contract test runs the web client against the API. What is left is the manual end to end pass once everything is finished.

### Left for last

Pieces that were postponed because they depend on infrastructure that comes later. Do them after the phases above, before or together with phase 6, and tick them here.

- [x] **Google sign-in** (phase 4b): authorization code flow with state and PKCE, `email` column on `oauth_accounts` (fills `profile.googleEmail`), the `account-exists` rule, `GET /api/auth/google` and its callback.
- [x] **Mail delivery**: done (see "Mail"). What is left is the provider account, domain and credentials (see "Sending real e-mail").
- [x] **Change e-mail**: done (see "Profile" and `docs/auth.md`).
- [ ] **Support contact** in the "e-mail changed" notice (see "Mail").
- [ ] **S3 compatible storage driver** (AWS S3 or Cloudflare R2): a second `StorageService`, `STORAGE_DRIVER=s3`, bucket, endpoint and credentials in env, `MEDIA_BASE_URL` pointing at the bucket or CDN. Needed before running more than one instance or on Fargate or Cloud Run.
- [ ] **Oversized upload through the Next rewrite**: a file above the limit answers `413` straight from the API, but through the web app's rewrite the connection is reset and Next answers `500`. The web client already blocks files above 10 MB, so only other clients see it.
- [ ] **Profile total in other currencies**: `profile/stats` only adds expenses in the main currency. Decide the exchange rate source (provider, daily snapshot, or rate stored on each expense) and sum everything.
- [x] **Swagger**: done (see "API docs (Swagger)").

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
- **E-mail:** recovery links are sent through the mail queue (see "Mail"). Without `MAIL_SMTP_URL` (development) the link is printed in the API log.
- Validation errors are `400` with field paths (the MSW mocks answer `422`; the web client treats any 4xx as a failure, so this is fine).

Tests (`test/auth.test.ts`) run against a real Postgres: `globalSetup` creates `bordo_test` on the compose Postgres and migrates it. Without a reachable Postgres they are skipped locally; CI sets `REQUIRE_DATABASE=1` and has a Postgres service, so a missing database fails there.

## Profile

`src/modules/profile`. All routes need a session and only touch the signed-in user's data.

| Route                              | Notes                                                                                                                                                                                                                                                            |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/profile`                 | The session user, in the shared `profileSchema` shape.                                                                                                                                                                                                           |
| `PATCH /api/profile`               | `name` and main `currency` only (`updateProfileSchema`). Unknown fields are dropped.                                                                                                                                                                             |
| `GET /api/profile/stats`           | Trips, days traveled (both ends counted), distinct destinations (case and space insensitive) and the total. See below.                                                                                                                                           |
| `GET /api/profile/export`          | CSV of every expense, same columns as the mock. UTF-8 with BOM, `no-store`. Amounts use the currency's decimals (`980.00` EUR, `4500` JPY). Cells that start with `=`, `+`, `-`, `@` get a leading quote so a spreadsheet does not run them.                     |
| `POST /api/profile/password-reset` | Same single use link as recovery, sent to the signed-in user (also how a Google-only account adds a password). 3 per hour per account.                                                                                                                           |
| `POST /api/profile/email-change`   | `{ email }`. Sends a single use link (1 hour, token stored hashed) to the NEW address; the e-mail only changes when it is confirmed (see below). Same answer if the address is the current one or has an account (nothing is sent then). 3 per hour per account. |
| `PUT /api/profile/photo`           | `multipart/form-data`, one image under `photo` (JPG, PNG or WEBP, up to 5 MB). Replaces the previous one and deletes its file (a Google photo URL is not ours to delete). `DELETE /api/profile/photo` clears it.                                                 |
| `DELETE /api/profile`              | Deletes the user, cascading to sessions, trips, expenses, photos and own categories, removes their stored files (profile and trip photos) and clears the cookie.                                                                                                 |

`totalInCents` adds only the expenses made in the profile's main currency. There is no exchange rate source, and adding euros to reais would be wrong. When trips in other currencies matter here, rates become a decision (provider, daily snapshot or rate at the time of the expense).

### Change of e-mail

1. `POST /api/profile/email-change` (session) sends `WEB_URL/confirmar-email?token=...` to the new address. One pending change per account: a new request replaces the previous link.
2. `GET /api/auth/email-change/:token` (public) returns `{ email }`, the address the link would switch the account to, or `410`. The web page checks it first and shows an explicit confirm button, so a mail scanner that only opens the link cannot spend it.
3. `POST /api/auth/email-change/confirm` `{ token }` (public, the token is the credential) switches the address in one transaction: the e-mail counts as verified, **every session and pending recovery link of the account ends** (they were tied to the old address), and the browser's cookie is cleared. `410` expired or used, `409` if someone took the address meanwhile (nothing changes and the link stays valid), `429` after 10 attempts per hour per IP.
4. After the change a notice goes to the old address, so a takeover does not go unnoticed.

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

## Trips

`src/modules/trips`. Scoped by the session user like the others: another user's trip answers `404`, malformed ids `400`.

| Route                | Notes                                                                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/trips`     | `tripSummarySchema[]`: the trip plus `spentInCents`, the sum of its expenses. Newest start date first (the web groups them into ongoing, upcoming and completed). |
| `GET /api/trips/:id` | `tripSchema`.                                                                                                                                                     |
| `POST /api/trips`    | `createTripSchema` (end not before start, budget above zero, supported currency). `201`. Owner, id and cover come from the server, never from the body.           |

- `coverPhotoUrl` comes from the trip's `cover_photo_id` photo, turned into a URL by `common/storage/photo-url.ts` (see "Photos and storage").
- `spentInCents` adds every expense of the trip. Expenses are expected to be in the trip's currency; the expenses module will enforce it.
- Editing and deleting a trip are not in the contract yet (the web has no screens for them).

## Expenses and base costs

`src/modules/expenses`. Routes live under a trip. The trip must be the user's (`404` otherwise, also for another user's expense ids) and every id in a path or filter must be a uuid (`400`).

| Route                                    | Notes                                                                                                                                                                         |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /api/trips/:tripId/expenses`        | Newest date first. Filters: `kind`, `search` (case insensitive, `%` and `_` are plain text), `categories` (comma separated uuids), `from`, `to` (inclusive), `paymentMethod`. |
| `POST /api/trips/:tripId/expenses`       | `createExpenseSchema`, `201`. Daily expenses and base costs use the same route (`kind`).                                                                                      |
| `PUT /api/trips/:tripId/expenses/:id`    | Full replace, same rules as create.                                                                                                                                           |
| `DELETE /api/trips/:tripId/expenses/:id` | `{ id }`.                                                                                                                                                                     |
| `GET /api/trips/:tripId/base-costs`      | Expenses of kind `BASE`, oldest first (booking order).                                                                                                                        |

Rules the server enforces beyond the shared schema (`422`):

- The expense currency is the trip's currency (this is what lets `spentInCents` and the profile total add amounts).
- The category is the user's own, of the same kind as the expense, and not hidden. Hidden categories are not offered for new expenses, but an expense that already has one keeps it when edited.
- The trip comes from the path, never from the body; the owner comes from the session.

`description` is trimmed by the shared schema (whitespace only is rejected). The date is not required to fall inside the trip: base costs are booked before it starts.

## Photos

`src/modules/photos`. Scoped like the other trip routes (another user's trip or photo is `404`, malformed ids `400`).

| Route                                       | Notes                                                                                                                                                                                            |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /api/trips/:tripId/photos`             | `photoSchema[]`, the cover first, then in upload order.                                                                                                                                          |
| `POST /api/trips/:tripId/photos`            | `multipart/form-data`, images under `files` (JPEG or PNG, up to 10 MB each, 10 per trip counting the existing ones). `201` with the created photos. The first photo of a trip becomes its cover. |
| `PUT /api/trips/:tripId/cover`              | `{ photoId }`, a photo of that trip. Answers the photo with `isCover: true`.                                                                                                                     |
| `DELETE /api/trips/:tripId/photos/:photoId` | `{ id }`. Deletes the row and the file. If it was the cover, the oldest remaining photo takes over, or the trip is left without one.                                                             |
| `GET /api/media/*`                          | Serves the local driver's files. Public (an `<img>` cannot send a token), immutable cache, not rate limited. Unknown or malformed keys are `404`.                                                |

- Every file is checked and processed before anything is stored, so one bad file rejects the batch (`422`, or `413` over the size limit) and nothing is left on disk. If saving the rows fails after the files were written, the files are removed.
- The limit is enforced under a lock on the trip row, so two uploads at once cannot both go past 10 (tested).
- Only upload routes accept `multipart/form-data` (`@AllowMultipart()`); every other mutation still has to be JSON.
- The limits (`MAX_PHOTOS`, `MAX_PHOTO_BYTES`, accepted types, avatar limits) live in `@bordo/shared/photos`; the web client uses the same numbers.
- A file that cannot be deleted from storage is logged, not fatal: the row is already gone.

## Web app against the API

- The web app calls the API by default. `BACKEND_URL` (default `http://localhost:3001` in development, required in production) feeds the `/api/*` rewrite, so the session cookie is first party. The MSW mocks are opt-in: `NEXT_PUBLIC_API_MOCKING=enabled`, development only. `apps/web/.env.example` documents both.
- The logged area layout reads the session on the server (`src/lib/server-session.ts`) and seeds the profile query, so the sidebar shows the right user on the first paint. A stale cookie renders the page and the client handles the `401`; the API clears the cookie on that response, which is what stops `/entrar` and `/viagens` from bouncing the visitor.
- **Contract test:** `pnpm --filter @bordo/web test:contract` runs the web app's own client functions (the ones the browser uses, with their Zod schemas) against a running API, in the order a user would: sign up, profile, categories, trips, expenses and base costs, filters, CSV, photos, profile photo, account deletion. By default it calls `http://localhost:3000`, so it goes through the Next rewrite; set `CONTRACT_API_URL=http://localhost:3001` to hit the API directly. It needs `pnpm dev:api` (and `pnpm dev` for the default) running, signs up a throwaway user per run (the sign-up limit is 10 per hour per IP; `redis-cli flushall` resets it) and deletes the account at the end. It is not part of `pnpm test` or CI.
- Features that still fail against the real API because their endpoint is not built: change e-mail (see "Left for last").

## Environment

Validated with Zod at boot (`src/config/env.ts`). The process exits with every problem listed. A `.env` file in `apps/api` is read outside production; real variables win.

| Variable              | Default                 | Notes                                                                                                               |
| --------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `NODE_ENV`            | `development`           | `production` turns off pretty logs and makes `REDIS_URL` mandatory                                                  |
| `PORT`, `HOST`        | `3001`, `0.0.0.0`       |                                                                                                                     |
| `LOG_LEVEL`           | `info`                  | `silent` in tests                                                                                                   |
| `REDIS_URL`           | none                    | Rate limit storage and readiness check. Without it the limit is in memory (one process only)                        |
| `DATABASE_URL`        | none                    | Postgres connection string. Optional in development and tests, mandatory in production                              |
| `DATABASE_POOL_MAX`   | `10`                    | Connections per API instance                                                                                        |
| `STORAGE_DRIVER`      | `local`                 | Only `local` for now                                                                                                |
| `STORAGE_LOCAL_DIR`   | `storage`               | Folder for uploaded files, relative to where the API starts. A volume in containers                                 |
| `MEDIA_BASE_URL`      | `/api/media`            | Prefix of the photo URLs. The bucket or CDN address once an S3 compatible driver exists                             |
| `MAIL_SMTP_URL`       | none                    | SMTP server as a URL (`smtps://user:password@host:465`). Required in production. Without it e-mails are only logged |
| `MAIL_FROM`           | none                    | Sender, `Bordo <nao-responda@yourdomain.com>`. Required in production                                               |
| `MAIL_WORKER`         | `true`                  | Run the e-mail worker in this process                                                                               |
| `MAIL_RETRY_DELAY_MS` | `10000`                 | First retry delay of a failed e-mail, doubled each attempt (5 attempts)                                             |
| `QUEUE_PREFIX`        | `bordo`                 | Prefix of the queue keys in Redis                                                                                   |
| `WEB_URL`             | `http://localhost:3000` | Public web address, used in e-mailed links                                                                          |
| `SWAGGER_ENABLED`     | on outside production   | Serves the API docs at `/api/docs`. Set `true` to publish them in production                                        |
| `TRUST_PROXY`         | none                    | Addresses or CIDRs of the proxies in front of the API, comma separated. Never a number                              |
| `THROTTLE_TTL_MS`     | `60000`                 | Window of the global limit                                                                                          |
| `THROTTLE_LIMIT`      | `120`                   | Requests per window per client IP                                                                                   |

## What is in place

- `GET /api/health` (liveness, never rate limited, not logged) and `GET /api/health/ready` (checks Redis, `503` with the failing dependency when down).
- Every error has the same shape: `{ statusCode, error, message, issues?, requestId }`. Unexpected errors never leak their message. Validation errors list the failing `path` of each field, with the pt-BR messages from the shared schemas.
- `x-request-id` is kept when the caller sends a sane one, generated otherwise, and shows up in the header, the logs and the error body.
- The global limit is a guard that fails open: if Redis breaks, traffic keeps flowing and the failure is logged. Sign-in and the other sensitive routes must not fail open, so phase 4 gives them their own strict guard.
- Mutations with a body must send `application/json` (`415` otherwise).
- Logs are JSON in production and pretty in development. `authorization`, `cookie` and `set-cookie` are redacted.
- `GET /api/health/ready` also checks Postgres (`select 1`).
- Every route except health and the public auth routes needs a session (global `AuthGuard`).

## Where we stopped

Last updated 2026-10-29. Done and merged: phases 1 to 3, 4a (e-mail and password auth), 5 (all domains: `profile`, `categories`, `trips`, `expenses` with base costs, `photos`). Phase 6 (web app against the API) is on the branch `feat/web-backend`.

### Next

1. The e-mail provider account and DNS (see "Sending real e-mail").
2. The items under "Left for last": S3 compatible storage driver (AWS S3 or Cloudflare R2), change e-mail, profile total in other currencies.
3. The manual end to end pass of the whole app, once the above is done.

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

## Google sign-in

- Routes: `GET /api/auth/google?next=/path[&link=1]` (`302` to Google) and `GET /api/auth/google/callback`. Both only ever answer redirects, never JSON, because they are browser navigations.
- Credentials (Google Cloud Console, OAuth client of type "Web application"): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, all three or none. The redirect URI is on the **web** address (`<web>/api/auth/google/callback`) because Next proxies `/api` to the API, which keeps the session cookie first-party. It must be listed under "Authorized redirect URIs" exactly. Without the credentials the button lands on `/entrar?error=google`.
- State and PKCE (S256): the state, the verifier and `next` live in the `bordo_oauth` cookie (httpOnly, `SameSite=Lax`, 10 minutes, path `/api/auth/google`), cleared on the callback whatever the outcome.
- The identity comes from the ID token returned by Google's token endpoint; issuer, audience, expiry and `email_verified` are checked. Unverified e-mails are refused.
- First access creates the user (`authProvider: GOOGLE`, verified, no password, default categories) and goes to `/onboarding`. A password account with the same e-mail is **not** linked: `/entrar?error=account-exists`. With `link=1` a signed-in user connects Google (one Google account per user, and a Google account belongs to one user); on failure the browser returns to `next` with `?google=error`.
- `oauth_accounts.email` holds the connected address and fills `profile.googleEmail`.
- Rate limit: 30 requests per 15 minutes per IP.

## API docs (Swagger)

- Swagger UI at `/api/docs` and the OpenAPI JSON at `/api/docs-json` (through the web app: `http://localhost:3000/api/docs`). Built from the routes with `@nestjs/swagger`; `nestjs-zod` turns the shared Zod schemas into the request and response models, so the docs come from the same source the web client validates with.
- On outside production; off in production unless `SWAGGER_ENABLED=true` (it is not passed by `compose.prod.yaml`). The document has no secrets, but it maps every route, so it is opt-in there.
- Authenticated routes are marked with the `bordo_session` cookie scheme (`@ApiSession()` on the controller). Sign in from the same browser and "Try it out" sends the cookie. The Google routes are browser navigations and are documented as redirects, so try them from the web app.
- Response models are in `src/common/docs/responses.ts`, one `createZodDto` per shared schema. A new route needs `@ApiTags` (controller), `@ApiOperation({ summary })` and its response `type`; `test/swagger.test.ts` fails if a route has no tag or summary, or if the cookie scheme is missing or present on the wrong routes.
- Setup is `common/http/configure-swagger.ts`, called from `main.ts`.
