# Authentication

The Node backend owns identity. Next.js owns the screens and the optimistic route guard.

## Why the backend owns it

- One source of truth for users, credentials and sessions, shared by any future client (mobile app, jobs).
- The frontend never stores passwords, tokens or sessions: the session is an `httpOnly` cookie it cannot read.
- Next.js `proxy.ts` and server code only need to know "is there a session cookie"; the backend decides if it is valid.

Next.js could also run an auth library (Auth.js, Better Auth) with its own database, but that would split users between two systems. If the backend team prefers a library, Better Auth works standalone on Node (Express/Fastify) and keeps this same contract.

## Flow

```
Browser ──/api/auth/*──▶ Next (rewrite, same origin) ──▶ Node backend ──▶ database
   ▲                                                         │
   └──────────── Set-Cookie: bordo_session (httpOnly) ◀──────┘
```

- `next.config.ts` rewrites `/api/*` to `BACKEND_URL` when it is set, so the cookie is first-party and there is no CORS. `BACKEND_URL` defaults to `http://localhost:3001` in development and must be set in production. The MSW mocks are opt-in (`NEXT_PUBLIC_API_MOCKING=enabled`, development only).
- `src/proxy.ts` redirects early using only the cookie: signed-out users on `/viagens`, `/perfil`, `/configuracoes`, `/onboarding` go to `/entrar?next=...`; signed-in users on `/` (the landing page), `/entrar`, `/criar-conta`, `/recuperar-senha` go to `/viagens`, so a returning visitor lands on the trips. The rules live in `src/lib/auth-routes.ts`. It is skipped while mocking.
- A stale cookie (expired or revoked session) would loop `/entrar` to `/viagens` and back, so the backend clears `bordo_session` on the `401` it answers, and a global `QueryCache` `onError` sends the user to `/entrar?next=...` when any query gets a `401`.
- The login survives closing the browser: the cookie has a 30 day `Max-Age` and slides while the user keeps coming back.
- The proxy is not the security boundary. Every `/api/*` route validates the session in the backend.

## Session

- Cookie `bordo_session`: opaque random id stored in a `sessions` table (id hash, user id, expires at, user agent). Opaque ids can be revoked, which signed JWTs cannot.
- `HttpOnly; Secure; SameSite=Lax; Path=/`, 30 days sliding. `SameSite=Lax` plus the same-origin rewrite covers CSRF for JSON endpoints; also require `Content-Type: application/json` on mutations.
- Passwords: Argon2id (or bcrypt) hash, never logged. Rate limit sign-in, sign-up and forgot-password by IP and by e-mail.

## Endpoints (contract used by `src/features/auth/api/client.ts`)

| Method and path                  | Body                  | Answer                                                                               |
| -------------------------------- | --------------------- | ------------------------------------------------------------------------------------ |
| `POST /api/auth/sign-up`         | `{ email, password }` | `201` user + cookie. `409` e-mail in use                                             |
| `POST /api/auth/sign-in`         | `{ email, password }` | `200` user + cookie. `401` wrong data                                                |
| `POST /api/auth/sign-out`        |                       | `200 {}` and clears the cookie                                                       |
| `GET  /api/auth/session`         |                       | `200` user, or `401`                                                                 |
| `POST /api/auth/forgot-password` | `{ email }`           | Always `200 { email }` (no enumeration)                                              |
| `GET  /api/auth/google`          | `?next=/path`         | `302` to Google                                                                      |
| `GET  /api/auth/google/callback` |                       | creates or links the user, sets cookie, `302` to `next` (new users to `/onboarding`) |

"user" is the `profileSchema` of `src/features/profile` (`id, name, email, emailVerified, photoUrl, currency, authProvider, createdAt`). Logged-in profile endpoints (`/api/profile/*`) are already specified there, including `POST /api/profile/password-reset` and `POST /api/profile/email-change`.

Password recovery: `forgot-password` e-mails a single-use link (token stored hashed, 1 hour) to `/recuperar-senha/nova?token=...`, which first calls `GET /api/auth/reset-password/:token`. The e-mail template is in the Pencil file ("E-mail · Recuperação de senha"). The new password must meet the four rules in `src/lib/password-strength.ts` (8+ characters, upper and lower case, a number, a special character): validate them again in the backend. The "Confira seu e-mail" screen allows resending after 45 seconds; rate limit it server side too.

## Google and the "pre-registration"

- Authorization code flow handled by the backend (state + PKCE), scopes `openid email profile`.
- First Google access creates the user with `authProvider: "GOOGLE"`, `emailVerified: true`, name and photo from Google, no password, and lands on `/onboarding`.
- If a password account with the same verified e-mail exists, do not link silently: send the user to `/entrar?error=account-exists`. Signing in with the password and then connecting Google from the profile (`?link=1`) links it.
- One account can have both ways in. The profile exposes `hasPassword` and `googleEmail` (null when Google is not connected); a Google-only account adds a password with `POST /api/profile/password-reset`, which e-mails the same single-use link.
- While mocking, `/api/auth/google` is a fetch answered by MSW with `{ redirectTo }` (a navigation cannot be mocked); the real endpoint is a `302`.

## Tables (suggested)

- `users(id, email unique, name, photo_url, currency, auth_provider, email_verified_at, password_hash null, created_at)`
- `sessions(id_hash, user_id, expires_at, created_at, user_agent)`
- `oauth_accounts(provider, provider_user_id, user_id)` unique on `(provider, provider_user_id)`
- `password_reset_tokens(token_hash, user_id, expires_at, used_at)`

## Frontend checklist when the backend exists

All done except the last item (see `docs/backend.md`, phase 6):

1. [x] `BACKEND_URL` (defaults to the local API in development) and mocks opt-in (`NEXT_PUBLIC_API_MOCKING=enabled`). See `apps/web/.env.example`.
2. [x] The `user` fallback of `src/app/(app)/layout.tsx` is gone: the layout reads the session on the server (`src/lib/server-session.ts`) and seeds the profile query with it, so the first paint already has the right name. With no session or a stale one it renders an empty identity and the client handles the `401`. The mock user only shows while the mocks run.
3. [x] A `401` from any query sends the user to `/entrar?next=...` (a global `QueryCache` `onError`), and the backend clears the stale cookie in that response.
4. [ ] Terms of use and privacy policy pages (`/termos`, `/privacidade`) are placeholders.
