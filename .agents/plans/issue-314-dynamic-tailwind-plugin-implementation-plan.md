# Plan: Issue 314 - Dynamic Tailwind Plugin

> Supersedes the earlier implementation direction captured in
> [issue-314-db-backed-tailwind-assets.md](./issue-314-db-backed-tailwind-assets.md).

## Goal

Implement issue 314 as a plugin-owned dynamic Tailwind system built on the new
plugin settings primitive, while preserving the normal build-time Tailwind asset
as a separate concern.

## Scope

This plan depends on the platform work described in:

- [plugin-settings-primitive-prd.md](./plugin-settings-primitive-prd.md)
- [plugin-settings-primitive-implementation-plan.md](./plugin-settings-primitive-implementation-plan.md)

## Settled Decisions

- there are two CSS assets, not one
- asset one is the standard application Tailwind build
- asset two is a second hashed utilities stylesheet generated from DB content
- asset two loads after asset one
- publish generates asset two when the DB-derived class set changes
- prebuild reconciliation may also generate or retarget asset two
- missing asset two is non-fatal
- persistence is plugin-owned through the generic settings primitive
- immutable hash-keyed records store CSS only
- singleton plugin state stores the active hash and current DB-derived class
  list
- concurrency semantics are last-write-wins
- shrink/removal exactness is deferred

## Recommended Slice Order

1. detach the concept from core-owned persistence
2. plugin persistence model on top of settings primitive
3. publish path generation
4. prebuild reconciliation
5. render and route integration
6. template/scaffolder alignment
7. tests and validation

## Phase 1: Reframe the feature boundary

### What to build

Separate asset-one and asset-two responsibilities in code and documentation.

Core should stop treating dynamic Tailwind as if it owns the application's full
stylesheet behavior.

### Acceptance criteria

- docs and code comments describe asset one and asset two as distinct
  responsibilities
- dynamic Tailwind compilation is clearly scoped to the second hashed asset
- the earlier issue-314 single-asset framing is marked as superseded

### Candidate files

- `packages/oberoncms/core/src/adapter/init-adapter.ts`
- `packages/oberoncms/core/src/adapter/tailwind-assets.ts`

## Phase 2: Plugin persistence model

### What to build

Move the dynamic Tailwind persistence model onto the plugin settings primitive.

The plugin should use:

- singleton state record for active hash and current DB class list
- immutable hash-keyed CSS records for compiled dynamic assets

### Acceptance criteria

- the plugin can read and write its state entirely through plugin settings
- no dedicated Tailwind asset table is required in the target model
- no site-owned `activeTailwindHash` field is required in the target model

### Candidate files

- plugin settings client code under the Tailwind feature implementation
- adapter persistence wiring replacing current Tailwind-specific methods

## Phase 3: Publish-driven generation

### What to build

Keep `updatePageData` as the live DB mutation boundary for deriving class-set
changes and generating asset two when needed.

### Acceptance criteria

- publish derives the submitted page class list from page data
- publish merges it with the rest of the published DB corpus
- publish generates a new hashed dynamic asset when the effective DB class set
  changes
- singleton plugin state updates to the new active hash and current class list

### Candidate files

- `packages/oberoncms/core/src/adapter/init-adapter.ts`
- dynamic Tailwind plugin behavior files

## Phase 4: Prebuild reconciliation

### What to build

Retain a prebuild reconciliation path for asset two specifically.

This path is allowed to:

- inspect the published DB class set
- regenerate the hashed dynamic asset when drift is detected
- retarget the active hash

### Acceptance criteria

- prebuild can backfill or regenerate asset two
- prebuild does not change the role of asset one
- prebuild behavior is documented as additive reconciliation, not replacement
  for the normal build-time Tailwind asset

### Candidate files

- `packages/oberoncms/core/src/adapter/init-adapter.ts`
- plugin `prebuild` integration path

## Phase 5: Route and render integration

### What to build

Preserve the public fetch-by-hash contract and load the dynamic stylesheet after
the standard asset.

### Acceptance criteria

- hashed assets remain publicly fetchable by hash
- public renderers attach the dynamic stylesheet outside core render
- the site still renders acceptably when the dynamic stylesheet is missing

### Candidate files

- `packages/oberoncms/core/src/adapter/init-oberon.ts`
- `apps/playground/app/(oberon)/[[...path]]/page.tsx`
- `recipes/nextjs/app/(oberon)/[[...path]]/page.tsx`

## Phase 6: App and scaffolder alignment

### What to build

Update the playground, recipe, and generated app contracts so they describe the
dynamic stylesheet as asset two only.

### Acceptance criteria

- playground wiring matches the plugin-owned model
- recipe wiring matches the plugin-owned model
- generated apps receive the correct adapter/plugin shape

### Candidate files

- `apps/playground/oberon/adapter.ts`
- `recipes/nextjs/oberon/adapter.ts`
- `packages/create-oberon-app/src/installer/install-adapter.ts`

## Phase 7: Test strategy and validation

### What to build

Rewrite tests to match the plugin-owned two-asset model.

### Acceptance criteria

- tests prove asset one and asset two remain distinct
- tests prove singleton state + hash-keyed CSS persistence through settings
- tests prove publish generation and prebuild reconciliation
- tests prove degraded render behavior when asset two is missing
- `pnpm validate` passes from repo root after implementation

## Risks and Mitigations

1. Risk: the plugin settings primitive lands but Tailwind still leaks behavior
   back into core Mitigation: keep persistence ownership and state conventions
   in the plugin
2. Risk: last-write-wins semantics create surprising state races Mitigation:
   document that the rewrite intentionally drops stale-write conflict behavior
3. Risk: the old issue-314 docs continue to mislead follow-up work Mitigation:
   explicitly mark the prior plan as superseded and link the new docs from any
   future handoff

## Completion Condition

This plan is complete when issue 314 is understood as a plugin-owned dynamic
Tailwind layer on top of the new plugin settings primitive, with the normal
build-time Tailwind asset preserved as a separate first-class concern.
