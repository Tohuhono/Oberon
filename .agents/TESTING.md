# Testing strategy

## Overview

- **Unit tests**: Vitest, per-package (co-located `src/**/*.test.ts`)
  - Run: `pnpm test` (turbo — builds workspace deps first, then vitest in each
    package)
- **E2E tests**: Playwright, `@dev/playwright` package (`dev/playwright/`)
  - Run locally (full): `pnpm test:e2e`
  - Run playground `@tdd` lane locally: `pnpm test:tdd`
  - Run playground `@tdd` lane in UI mode: `pnpm test:tdd:ui`
  - Run full PR validation from repo root: `pnpm validate`
  - Run locally/CI (deployed smoke):
    `PLAYWRIGHT_BASE_URL=<deployment-url> pnpm test:smoke -- --project <docs|playground>`
  - Shared config: `dev/playwright/base.config.ts`
  - Deployed smoke config: `dev/playwright/playwright.config.ts`
  - Playground TDD config: `apps/playground/playwright.tdd.config.ts`
  - Shared CMS specs: `dev/playwright/cms/**/*.spec.ts`
  - Host smoke specs: `apps/{documentation,playground}/test/**/*.spec.ts`

## Unit test scope

Test pure logic only — functions with branching, transformation, or algorithmic
logic that have **no framework dependencies** (no Next.js, no React, no
database).

The test should protect against regressions in _our_ logic, not verify library
behaviour.

### What to test

- Functions with real branching or conditional logic
- Data transformation pipelines
- String building / template generation
- Algorithms (concurrency control, chunking, version comparison)

### What NOT to test

- Zod schema declarations (tests the library, not our code)
- React components, hooks, providers (covered by e2e)
- Server actions, Next.js runtime (redirect, notFound, caching)
- Adapter wiring, database operations (covered by e2e)
- Simple re-exports, type-only files, trivial one-liners (covered by tsc)

If a function needs Next.js or React to run, it is not a unit test candidate.

## Conventions

- Co-located siblings: `src/foo.test.ts` next to `src/foo.ts`
- One `describe` per module, `it` per behaviour
- No mocking framework dependencies — keep tests simple and direct
- Do not export functions solely to enable testing — unexported functions are
  implementation details; test only via the public API
- Every workspace package has a `vitest.config.ts` and `"test": "vitest run"`
  script pre-scaffolded — just add a `.test.ts` file to start testing

## E2E lane conventions

- Shared Playwright lane constants live in `@dev/playwright/projects`
- Treat lane constants as fixed canonical defaults
  - consumers compose from shared constants in app/package configs
  - do not mutate shared constant values directly
- Keep app/package Playwright config as the composition root
  - app-specific `webServer` and root `use` stay local
  - lane-specific defaults (for example authenticated storage state) come from
    shared constants
- Tag semantics:
  - `@auth`: shared auth bootstrap lane
  - `@cms`: shared authenticated CMS behavior lane
  - `@tdd`: opt-in authenticated CMS red/green lane
  - `@pages`, `@users`, etc.: stable feature tags for targeted TDD runs
  - `@login`: unauthenticated login behavior lane
  - `@smoke`: host-specific smoke lane
- Broad tag discovery is intentional; CI/tag discipline is the guardrail for
  accidental collisions.

## Agent workflow

- Final validation for PR work, review replies, and issue-closure claims must
  run from repo root with `pnpm validate`
- Do not replace final validation with package-local scripts, direct
  `playwright` commands, `--list`, or manually filtered `turbo` runs
- Use package-local and direct Playwright commands only for exploration or when
  the user explicitly asks for a narrower run

## TDD grep workflow

Use the root playground TDD commands and add grep filters after `--`:

- Run all TDD coverage: `pnpm test:tdd`
- Run all current `@tdd` specs: `pnpm test:tdd -- --grep '@tdd'`
- Run a feature slice: `pnpm test:tdd -- --grep '@tdd.*@pages'`
- Run a feature slice for one issue:
  `pnpm test:tdd -- --grep '@tdd.*@pages.*@issue-308'`
- Open the same feature slice in UI mode:
  `pnpm test:tdd:ui -- --grep '@tdd.*@pages'`

Current repo examples:

- `@tdd @pages @issue-308` in `dev/playwright/cms/tdd-pages.spec.ts`

## Current candidates

Examples to guide future decisions:

- `core/src/adapter/transforms.ts` — `getTransforms`,
  `getComponentTransformVersions`
- `core/src/lib/utils.ts` — `getTitle`, `resolveSlug` (module imports
  `next/navigation`; needs Next.js resolution to be testable)
- `@tohuhono/utils` — `mapConcurrent`, `getRandomInt`
