# Testing strategy

## Overview

- **Unit tests**: Vitest, per-package (co-located `src/**/*.test.ts`)
- **E2E tests**: Playwright, see `tests/e2e/`
- **Run**: `pnpm test` (turbo — builds workspace deps first, then runs vitest in
  each package)

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
- Every workspace package has a `vitest.config.ts` and `"test": "vitest run"`
  script pre-scaffolded — just add a `.test.ts` file to start testing

## Current candidates

Examples to guide future decisions:

- `core/src/adapter/transforms.ts` — `getTransforms`,
  `getComponentTransformVersions`
- `core/src/lib/utils.ts` — `getTitle`, `resolveSlug`
- `@tohuhono/utils` — `mapConcurrent`, `getRandomInt`
- `create-oberon-app` installer — `createAdapter`, `parsePackageJson`,
  `getDependencyMap`
