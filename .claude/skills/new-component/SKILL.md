---
name: new-component
description: Conventions and file templates for creating a Bordo component (atom, molecule, organism, template). Use together with the component-architect agent.
---

# New component

Read the "Where does a component go?" table in `CLAUDE.md` before choosing the folder.

## Files

```
src/components/<level>/<kebab-name>/
  <kebab-name>.tsx
  <kebab-name>.stories.tsx
  <kebab-name>.test.tsx
  index.ts            // export { Name } from "./<kebab-name>"; export type { NameProps } ...
```

## Component template

```tsx
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const nameVariants = cva("base classes using tokens", {
  variants: { tone: { neutral: "...", success: "..." } },
  defaultVariants: { tone: "neutral" },
});

export type NameProps = React.ComponentProps<"div"> & VariantProps<typeof nameVariants>;

export function Name({ className, tone, ...props }: NameProps) {
  return <div className={cn(nameVariants({ tone }), className)} {...props} />;
}
```

## Story template (Storybook, CSF3)

```tsx
import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Name } from "./name";

const meta = { title: "Atoms/Name", component: Name, tags: ["autodocs"] } satisfies Meta<
  typeof Name
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: {} };
```

Title prefix matches the level: `Atoms/`, `Molecules/`, `Organisms/`, `Templates/`. Add one story per variant and per relevant state.

## Test template (Vitest + Testing Library)

Test behavior and accessibility (roles, labels, text), not class names. Cover each variant's visible output and each interaction.

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Name } from "./name";

describe("Name", () => {
  it("renders", () => {
    render(<Name>content</Name>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});
```

## Checklist

- Named exports, `NameProps`, `cva`, `cn`, no `any`, no default export.
- Tokens only (no hex, no arbitrary colors). Coral `cta` only for primary actions.
- Props only below `features/`; no fetching, no stores in atoms to templates.
- pt-BR copy, no em dashes. English code.
- `"use client"` only if the component itself uses state, effects or browser APIs.
- `pnpm lint && pnpm typecheck && pnpm test` pass.
