# Testing strategy

## Overview

- **Unit tests**: Vitest, per-package (co-located `src/**/*.test.ts`)
  - Run: `pnpm test` (turbo — builds workspace deps first, then vitest in each
    package)
- **E2E tests**: Playwright, `@dev/playwright` package (`dev/playwright/`)
  - Run locally (full): `pnpm test:e2e`
  - Run shared CMS contracts locally: `pnpm test:contract`
  - Run playground `@tdd` lane locally: `pnpm test:tdd`
  - Run locally/CI (deployed smoke):
    `PLAYWRIGHT_BASE_URL=<deployment-url> pnpm test:smoke -- --project <docs|playground>`
  - Shared config: `dev/playwright/base.config.ts`
  - Deployed smoke config: `dev/playwright/playwright.config.ts`
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
  - `@contract`: shared authenticated CMS product contract lane
  - `@tdd`: opt-in authenticated CMS red/green lane
  - `@login`: unauthenticated login behavior lane
  - `@smoke`: host-specific smoke lane
- Broad tag discovery is intentional; CI/tag discipline is the guardrail for
  accidental collisions.

## Current candidates

Examples to guide future decisions:

- `core/src/adapter/transforms.ts` — `getTransforms`,
  `getComponentTransformVersions`
- `core/src/lib/utils.ts` — `getTitle`, `resolveSlug` (module imports
  `next/navigation`; needs Next.js resolution to be testable)
- `@tohuhono/utils` — `mapConcurrent`, `getRandomInt`
