---
name: new-feature
description: Scaffold a new domain under src/features/<domain> (api keys, queries, mutations, schemas, types, MSW handlers and fixtures). Use for trips, expenses, base-costs, categories and future domains.
---

# New feature scaffold

Domain names are kebab-case English: `trips`, `expenses`, `base-costs`, `categories`.

## Structure

```
apps/web/src/features/<domain>/
  api/
    keys.ts          // query key factory
    queries.ts       // queryOptions + hooks (useTrips, useTrip)
    mutations.ts     // useMutation hooks, invalidate via keys
    client.ts        // fetch functions, parse responses with the Zod schemas
  types/
    index.ts         // re-export inferred types
  components/        // domain-aware components (may use queries, mutations, stores)
  index.ts           // public API of the feature
apps/web/src/mocks/
  fixtures/<domain>.ts
  handlers/<domain>.ts   // MSW http handlers, added to handlers/index.ts
```

## Rules

- Query keys only from `keys.ts`:

```ts
export const tripKeys = {
  all: ["trips"] as const,
  lists: () => [...tripKeys.all, "list"] as const,
  detail: (id: string) => [...tripKeys.all, "detail", id] as const,
};
```

- Server data stays in TanStack Query. Never copy it to Zustand.
- Money is integer cents plus an ISO currency code. Dates are ISO strings in the API, parsed with date-fns at the edge.
- Zod schemas live in `packages/shared/src/<domain>/<domain>.schema.ts` (plus an `index.ts` barrel) and are imported as `@bordo/shared/<domain>`. They are the single source for forms and API types; types come from `z.infer` in the feature `types/` folder.
- Fetch functions hit `/api/...` and parse with the schema, so MSW handlers and the future backend share the contract.
- Fixtures use the trip "Lisboa & Sintra" as the main example.
- Features may import from `components/*` and `lib`; `components/*` must never import from `features`.
- Add a test for the schema and for each query/mutation using MSW in Node when it has logic.
