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

- `next.config.ts` rewrites `/api/*` to `BACKEND_URL` when it is set, so the cookie is first-party and there is no CORS. In development MSW answers `/api/*` instead (`NEXT_PUBLIC_API_MOCKING=disabled` turns it off).
- `src/proxy.ts` redirects early using only the cookie: signed-out users on `/viagens`, `/perfil`, `/configuracoes`, `/onboarding` go to `/entrar?next=...`; signed-in users on `/entrar`, `/criar-conta`, `/recuperar-senha` go to `/viagens`. The rules live in `src/lib/auth-routes.ts`. It is skipped while mocking.
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

Password recovery: `forgot-password` e-mails a single-use link (token stored hashed, 1 hour) to a page that sets a new password; that page is a follow-up (`/recuperar-senha/nova`, not designed yet).

## Google and the "pre-registration"

- Authorization code flow handled by the backend (state + PKCE), scopes `openid email profile`.
- First Google access creates the user with `authProvider: "GOOGLE"`, `emailVerified: true`, name and photo from Google, no password, and lands on `/onboarding`.
- If a password account with the same verified e-mail exists, link the Google identity to it instead of creating a second user.
- The UI already handles `authProvider` (`SecuritySection` hides password actions for Google accounts). The login screens in Pencil have no "Continuar com Google" button yet; `getGoogleSignInUrl()` is ready for when it is designed.

## Tables (suggested)

- `users(id, email unique, name, photo_url, currency, auth_provider, email_verified_at, password_hash null, created_at)`
- `sessions(id_hash, user_id, expires_at, created_at, user_agent)`
- `oauth_accounts(provider, provider_user_id, user_id)` unique on `(provider, provider_user_id)`
- `password_reset_tokens(token_hash, user_id, expires_at, used_at)`

## Frontend checklist when the backend exists

1. Set `BACKEND_URL` (server) and `NEXT_PUBLIC_API_MOCKING=disabled`.
2. Replace the `user` fallback of `src/app/(app)/layout.tsx` with a server-side session read if a flash of the fallback name bothers.
3. Handle a `401` from any query by sending the user to `/entrar?next=...` (a global `QueryCache` `onError`).
4. Add the Google button and the "new password" page when they are designed.
