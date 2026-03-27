# Plan: Issue 314 - Dynamic Tailwind Plugin

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

1. establish the feature boundary
2. plugin persistence model on top of settings primitive
3. publish path generation
4. prebuild reconciliation
5. render and route integration
6. template/scaffolder alignment
7. tests and validation

## Phase 1: Establish the feature boundary

### What to build

Separate asset-one and asset-two responsibilities in code and documentation.

The implementation should keep dynamic Tailwind from taking ownership of the
application's full stylesheet behavior.

### Acceptance criteria

- docs and code comments describe asset one and asset two as distinct
  responsibilities
- dynamic Tailwind compilation is clearly scoped to the second hashed asset
- implementation boundaries make it clear that the standard application
  stylesheet remains a separate concern

### Candidate files

- `packages/oberoncms/core/src/adapter/init-adapter.ts`
- `packages/oberoncms/core/src/adapter/export-tailwind-clases.ts`
- `apps/playground/app/app.css`
- `recipes/nextjs/app/app.css`

## Phase 2: Plugin persistence model

### What to build

Move the dynamic Tailwind persistence model onto the plugin settings primitive.

The plugin should use:

- singleton state record for active hash and current DB class list
- immutable hash-keyed CSS records for compiled dynamic assets

### Acceptance criteria

- the plugin can read and write its state entirely through plugin settings
- no dedicated Tailwind asset table is required in the target model
- no Tailwind-specific field on the site record is required in the target model

### Candidate files

- new Tailwind plugin package files

## Phase 3: Publish-driven generation

### What to build

Use `updatePageData` as the live DB mutation boundary for deriving class-set
changes and generating asset two when needed.

### Acceptance criteria

- publish derives the submitted page class list from page data
- publish merges it with the rest of the published DB corpus
- publish generates a new hashed dynamic asset when the effective DB class set
  changes
- singleton plugin state updates to the new active hash and current class list

### Candidate files

- dynamic Tailwind plugin behavior files

## Phase 4: Prebuild reconciliation

### What to build

Extend the current prebuild path so it can reconcile asset two specifically.

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

- `packages/oberoncms/core/src/adapter/export-tailwind-clases.ts`
- `packages/oberoncms/core/src/adapter/init-adapter.ts`
- plugin `prebuild` integration path

## Phase 5: Route and render integration

### What to build

Add a public fetch-by-hash contract and load the dynamic stylesheet after the
standard asset.

### Acceptance criteria

- hashed assets remain publicly fetchable by hash
- public renderers attach the dynamic stylesheet outside core render
- the site still renders acceptably when the dynamic stylesheet is missing

This phase starts from a branch where public rendering does not currently load
any dynamic stylesheet.

### Candidate files

- `packages/oberoncms/core/src/adapter/init-oberon.ts`
- `packages/oberoncms/core/src/render.tsx`
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
- `apps/playground/app/app.css`
- `recipes/nextjs/oberon/adapter.ts`
- `recipes/nextjs/app/app.css`
- `packages/create-oberon-app/src/installer/install-adapter.ts`

## Phase 7: Test strategy and validation

### What to build

Add tests for the plugin-owned two-asset model.

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
   document that the first slice accepts plain last-write-wins behavior and add
   stronger concurrency control only if real races justify it
3. Risk: the runtime asset path keeps inheriting assumptions from the current
   core-owned Tailwind implementation Mitigation: keep the two-asset model
   explicit in docs, tests, and plugin boundaries

## Completion Condition

This plan is complete when issue 314 is understood as a plugin-owned dynamic
Tailwind layer on top of the new plugin settings primitive, with the normal
build-time Tailwind asset preserved as a separate first-class concern.
