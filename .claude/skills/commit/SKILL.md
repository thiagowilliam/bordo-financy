---
name: commit
description: Conventional Commits rules for Bordo, enforced by commitlint. Use when writing or checking a commit message.
---

# Commit rules

Format: `type(scope): subject`

- **type**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`
- **scope** (required, one of): `trips`, `expenses`, `base-costs`, `categories`, `auth`, `ui`, `design-system`, `config`, `deps`, `mocks`
- **subject**: English, imperative, lowercase, no trailing period, header max 72 characters.
- Body (optional): explain why, not what. Wrap at 100.
- Breaking change: `!` after the scope and a `BREAKING CHANGE:` footer.

## Choosing the scope

| Change                                                              | Scope                                           |
| ------------------------------------------------------------------- | ----------------------------------------------- |
| Next/TS/ESLint/Prettier/Vitest/MSW/Husky/Storybook setup, CLAUDE.md | `config`                                        |
| Dependency bumps only                                               | `deps`                                          |
| shadcn components, atoms/molecules/organisms/templates              | `ui`                                            |
| Tokens, globals.css, `/_design`, Storybook foundations              | `design-system`                                 |
| A feature domain                                                    | `trips`, `expenses`, `base-costs`, `categories` |
| MSW handlers and fixtures                                           | `mocks`                                         |
| Auth0                                                               | `auth`                                          |

## Config (already in the repo)

`commitlint.config.mjs` extends `@commitlint/config-conventional` with the scope list above, `subject-case` lower-case, `subject-full-stop` never and `header-max-length` 72. Husky runs `commitlint` on `commit-msg` and `lint-staged` on `pre-commit`.

## Examples

- `feat(expenses): add expense drawer store`
- `fix(ui): use local cn utility in shadcn components`
- `chore(deps): bump tanstack query`
