# Testing strategy

## Overview

- **Unit tests**: Vitest, per-package (co-located `src/**/*.test.ts`)
  - Run full package unit lane: `pnpm test:unit`
  - Shared config + typed test helper: `@dev/vitest`
- **E2E tests**: Playwright, `@dev/playwright` package (`dev/playwright/`)
  - Run locally (full): `pnpm test:e2e`
  - Run playground `@tdd` lane locally: `pnpm test:tdd`
  - Run full PR validation from repo root: `pnpm validate`
  - Run locally/CI (deployed smoke):
    `PLAYWRIGHT_BASE_URL=<deployment-url> pnpm test:smoke -- --project <docs|playground>`
  - Shared config: `dev/playwright/base.config.ts`
  - Deployed smoke config: `dev/playwright/playwright.config.ts`
  - Playground TDD config: `apps/playground/playwright.tdd.config.ts`
  - Shared CMS happy path specs: `dev/playwright/cms/**/*.spec.ts`
  - Shared TDD specs: `dev/playwright/tdd/**/*.spec.ts`
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
- For adapter or adapter-like plugin tests, prefer the shared fixtures from
  `@oberoncms/testing` before inventing package-local harnesses
  - use `createAdapterTests(...)` for canonical adapter contract coverage
  - use `createAdapterTest(test)` or `createPluginTest(test)` when you need
    package-specific cases on top of a shared adapter fixture
  - only add custom local fixtures for behavior the shared adapter fixtures
    cannot express cleanly
- Do not export functions solely to enable testing — unexported functions are
  implementation details; test only via the public API
- Unit-test packages expose `test:unit` (`vitest run`) and `test:watch`
  (`vitest`) scripts — just add a `.test.ts` file to start testing

## Unit tag conventions

- Prefer suite-level `describe(..., { tags: [...] }, ...)` tags over tagging
  every individual test
- Stable tags:
  - `baseline` - pre-existing or otherwise non-AI baseline tests
  - `ai` - agent-authored test provenance
  - `slow` - expensive unit tests that are awkward in tight red/green loops
- Dynamic slice tags are allowed for current work, for example:
  - `issue-308`
  - `bug-123`
  - `feature-editor-refactor`
- Mixed files are allowed, but keep provenance boundaries explicit with tagged
  suites instead of ambiguous untagged blocks
- Canonical narrow agent loop example:
  - `pnpm test:watch --tags-filter="ai && issue-308"`
- Broader provenance filters are also valid:
  - `pnpm test:watch --tags-filter="baseline"`
  - `pnpm test:watch --tags-filter="ai && !slow"`

## E2E lane conventions

- Shared Playwright lane constants live in `@dev/playwright/projects`
- Directory split is part of the contract
  - `dev/playwright/cms/**/*.spec.ts` is for shared `@cms` contract coverage
  - `dev/playwright/tdd/**/*.spec.ts` is for opt-in `@tdd` red/green coverage
  - do not place `@tdd` specs under `dev/playwright/cms`
  - do not place shared `@cms` contract specs under `dev/playwright/tdd`
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

- First map the verification need to an approved root script from `package.json`
- If the need is covered by `pnpm validate`, use `pnpm validate`
- Final validation for PR work, review replies, and issue-closure claims must
  run from repo root with `pnpm validate`
- If you changed code or docs and are about to say the work is complete, fixed,
  or ready for commit/review, `pnpm validate` is the completion gate
- The only narrower routine exceptions are from repo root only:
  - `pnpm install`
  - `pnpm test:tdd --grep '...'`
  - `pnpm test:unit ...`
  - `pnpm test:coa`
- Reproduction must stay inside the approved test-script allowlist
- Do not use `pnpm build`, `pnpm start`, package-local scripts, direct
  `playwright` commands, `--list`, or manually filtered `turbo` runs to
  reproduce, debug, or validate behavior
- If the approved test-script allowlist cannot reproduce the issue, write or
  extend a test so reproduction stays inside the approved test-script path
- If creating or extending that test path is not possible within the current
  repo workflow, stop and ask before doing anything else

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

- `@tdd @pages @issue-308` in `dev/playwright/tdd/tdd-pages.spec.ts`

## Current candidates

Examples to guide future decisions:

- `core/src/adapter/transforms.ts` — `getTransforms`,
  `getComponentTransformVersions`
- `core/src/lib/utils.ts` — `getTitle`, `resolveSlug` (module imports
  `next/navigation`; needs Next.js resolution to be testable)
- `@tohuhono/utils` — `mapConcurrent`, `getRandomInt`
