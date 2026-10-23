# Bordo

Bordo is a travel finance diary. Users create trips (with photos), register base costs (flights, lodging, car rental, insurance...) and log day-to-day expenses during the trip (date, category, payment method, amount, description), tracking spending against a budget.

- Product language: Brazilian Portuguese (pt-BR). All user-facing text, URLs and route segments are in pt-BR.
- Code language: English. Files, folders, identifiers, types, comments and commits are in English.

## Stack

- Next.js (latest stable), App Router, TypeScript strict, Turbopack, React Compiler, typed routes
- Tailwind CSS (CSS-first config with `@theme`) + shadcn/ui + Radix UI
- TanStack Query (server state), Zustand (UI state), nuqs (URL state)
- React Hook Form + Zod
- date-fns (ptBR locale), react-day-picker, Recharts (via shadcn Chart), sonner, lucide-react, Motion
- MSW (API mocks while the backend is not ready)
- Storybook, Vitest + Testing Library
- ESLint flat config (no `next lint`), Prettier + prettier-plugin-tailwindcss, Husky + lint-staged + commitlint
- Package manager: pnpm

Always check the current official docs before adding or configuring a tool. Do not rely on memory for APIs.

## Commands

```bash
pnpm dev          # dev server (Turbopack)
pnpm build        # production build
pnpm lint         # ESLint
pnpm lint:fix
pnpm format       # Prettier
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest
pnpm storybook
```

Before saying a task is done: run `pnpm lint`, `pnpm typecheck` and `pnpm test`. Run `pnpm build` when routes, config or providers changed.

## State management rules

| Kind of state                     | Tool           | Examples                                                       |
| --------------------------------- | -------------- | -------------------------------------------------------------- |
| Server data                       | TanStack Query | trips, expenses, base costs, categories                        |
| UI state shared across components | Zustand        | expense drawer open + mode, sidebar collapsed                  |
| State that belongs in the URL     | nuqs           | Dia a dia filters (search, categories, period, payment method) |
| Local component state             | `useState`     | input focus, a popover open                                    |

- Never copy server data into Zustand. One source of truth.
- Zustand stores are small, split by responsibility, and consumed through typed selectors.
- Query keys come from a key factory per feature (`features/<domain>/api/keys.ts`).

## Folder structure (hybrid atomic design)

```
src/
  app/                     routes only: layouts, pages, loading, error
    (public)/              landing (/)
    (auth)/                entrar, criar-conta, recuperar-senha, onboarding
    (app)/                 logged area with sidebar layout
      viagens/
        nova/
        [tripId]/          visao geral (page.tsx), custos-base/, dia-a-dia/, fotos/
      configuracoes/categorias/
  components/
    ui/                    shadcn generated components (CLI only, minimal edits)
    atoms/
    molecules/
    organisms/
    templates/
  features/<domain>/       trips | expenses | base-costs | categories
    api/                   keys.ts, queries.ts, mutations.ts
    schemas/               Zod schemas (future: packages/shared)
    types/
    components/            domain-aware components
  lib/                     cn, query-client, money/date formatting, env
  stores/                  Zustand stores
  mocks/                   MSW handlers + fixtures
  providers/
```

### Where does a component go?

| Level                           | Rule                                                                                              |
| ------------------------------- | ------------------------------------------------------------------------------------------------- |
| `ui/`                           | Only shadcn CLI output. Wrap instead of heavily editing.                                          |
| `atoms/`                        | One visual element. May wrap a single `ui/` primitive. No domain logic.                           |
| `molecules/`                    | Small group of atoms/ui with one purpose. Props only.                                             |
| `organisms/`                    | A section of the interface. Composes molecules. May hold local UI state. Props only, no fetching. |
| `templates/`                    | Page skeletons with slots (`AppShell`, `TripShell`).                                              |
| `features/<domain>/components/` | Knows the business domain, uses queries/mutations/stores.                                         |

Import direction is one way: `ui -> atoms -> molecules -> organisms -> templates -> features -> app`. A level never imports from a level to its right.

**Always use the `component-architect` agent when creating a new component.**

## Component conventions

- One folder per component, kebab-case: `components/molecules/expense-item/`
  - `expense-item.tsx`, `expense-item.stories.tsx`, `expense-item.test.tsx`, `index.ts`
- Named exports only. Props type named `<Component>Props`.
- Variants with `cva`; class merging with `cn`.
- Server Component by default. Add `"use client"` only to the leaf that needs it.
- Accessible by default: semantic HTML, labels, focus states, keyboard support (Radix handles most of it).
- No hardcoded colors, spacing or radii. Use design tokens only.

## Domain conventions

- Money is always an integer in cents plus an ISO currency code. Never floats. Render with the `<Money>` atom (`Intl.NumberFormat`, pt-BR).
- Dates via date-fns with the `ptBR` locale.
- Expense `kind`: `DAILY` (Dia a dia) or `BASE` (Custo de base).
- Payment methods: `CASH`, `PIX`, `DEBIT`, `CREDIT`, `INTERNATIONAL_CARD`.
- Zod schemas are the single source for form validation and API types (`z.infer`).

## Design tokens

Defined in `src/app/globals.css` as shadcn variables. Source of truth is the Pencil file (Pencil MCP).

| Token                           | Value                           | Usage                                              |
| ------------------------------- | ------------------------------- | -------------------------------------------------- |
| background                      | `#F7F3EC` (sand)                | app background                                     |
| card / popover                  | `#FFFFFF`                       | surfaces                                           |
| foreground                      | `#1C2B2E`                       | main text                                          |
| primary                         | `#0E7C86` (tide blue)           | brand, active nav, highlighted values, charts      |
| cta                             | `#E8734A` (coral)               | ONLY the "Lancar gasto" button and primary actions |
| success / warning / destructive | soft green / amber / dark coral | budget status: ok, above 80%, over budget          |
| chart-1..8                      | from Pencil                     | category colors                                    |

Other tokens: `muted-foreground` `#5E7275`, `subtle-foreground` `#94A3A5`, `border`/`input` `#E6DFD1`, `secondary`/`muted` `#EFE8DB`. Status colors have `-soft` (background) and `-ink` (text) variants: `success-soft`, `success-ink`, `warning-soft`, `warning-ink`, `destructive-soft`, `destructive-ink`. Also `primary-soft`, `primary-strong`, `cta-soft`. `chart-1..6` are category colors from Pencil; `chart-7` (`#0E7C86`) and `chart-8` (`#8CC5C9`) reuse brand tones.

- shadcn's `accent` is a neutral hover surface (sand). Coral is `cta`, never `accent`.
- `--radius` is 14px. Cards use `rounded-xl`, pills use `rounded-full`.
- Font: Figtree via `next/font` (`--font-figtree`).
- Financial values use the `financial-value` utility (`tabular-nums lining-nums`). Dark mode: `.dark {}` is an empty placeholder.
- Dev-only design page at `/_design` (folder `src/app/%5Fdesign`, since `_` folders are private in Next.js).

## Setup decisions

- MSW 3: import `http`/`HttpResponse` from `msw/http`, `setupWorker` from `msw/browser`, option `onUnhandledFrame`. Mocks run only in development (`NEXT_PUBLIC_API_MOCKING=disabled` turns them off). `next.config.ts` aliases `msw/browser` for Turbopack's SSR pass.
- `/api/*` is served by MSW. Handlers and fixtures live in `src/mocks`; every feature's client function parses responses with its Zod schema.
- Base costs are expenses with `kind: "BASE"`. Daily expenses are `kind: "DAILY"`.
- Client components that receive icons from a Server Component take rendered elements (`icon: <MapPin />`), not component references.
- Vitest config is `vitest.config.mts` (`resolve.tsconfigPaths`). Testing Library cleanup runs in `vitest.setup.ts`.
- `pnpm typecheck` runs `next typegen` first so `PageProps`/`LayoutProps` exist.
- Storybook 10 with `@storybook/nextjs-vite`, stories colocated with components, `.storybook/preview.tsx` loads `globals.css` and Figtree.

## Git

- Conventional Commits, enforced by commitlint. Use the `commit-standardizer` agent or the `commit` skill.
- Format: `type(scope): subject`, subject in English, imperative, lowercase, no period, max 72 chars.
- Scopes: `trips`, `expenses`, `base-costs`, `categories`, `auth`, `ui`, `design-system`, `config`, `deps`, `mocks`.

## Agents and skills

| Name                       | Type  | When                                                 |
| -------------------------- | ----- | ---------------------------------------------------- |
| `component-architect`      | agent | creating or moving any component                     |
| `design-fidelity-reviewer` | agent | after building UI, compare against the Pencil design |
| `commit-standardizer`      | agent | preparing commits                                    |
| `new-component`            | skill | conventions and templates for component files        |
| `new-feature`              | skill | scaffolding a new domain under `features/`           |
| `commit`                   | skill | Conventional Commits rules                           |

## Don'ts

- Do not fetch data inside `components/` (atoms to templates).
- Do not put server data in Zustand.
- Do not use the coral `cta` color outside primary actions.
- Do not edit shadcn components beyond small token adjustments.
- Do not use `any`. Do not use default exports (except where Next.js requires them: pages, layouts).
- Do not use em dashes in UI copy.
