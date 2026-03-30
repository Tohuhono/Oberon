# Issue 318 Handover

## Snapshot

- branch: `finalise/20260327-171412-key-value-store-contract`
- PR: #320
- PR URL: https://github.com/Tohuhono/Oberon/pull/320
- PR title: `WIP Add key value store sqlite persistence`
- PR state: open draft against `main`
- latest validation check: `set -o pipefail && pnpm validate` passed from repo
  root, but it was a fully cached run

## What This Branch Actually Contains Now

This is no longer a pure "contract stubs" branch.

Verified on the current tree:

- core adapter contract exposes `getKV`, `putKV`, and `deleteKV`
- core now centralises default adapter stubs through `stubbedAdapter`
- `notImplemented` now throws a dedicated `NotImplementedError`
- mock plugin KV methods were aligned to that error type
- sqlite has a real KV table schema and migration
- sqlite has real `getKV` and `putKV` persistence
- pgsql still exposes KV stubs only
- turso should inherit sqlite behavior for implemented KV methods through the
  shared sqlite path, but this has not been explicitly re-verified in this
  handover pass
- docs and `create-oberon-app` custom database template now include the KV
  contract surface
- a side quest added reusable adapter-test helpers in `@oberoncms/core/testing`
  and migrated the development plugin KV unit test to that shared pattern

## What Is No Longer Accurate From The Previous Handover

The old handover said sqlite was still stub-only. That is now false.

Current sqlite status:

- schema exists
- migration exists
- `getKV` implemented
- `putKV` implemented
- `deleteKV` still stubbed

Current pgsql status:

- no KV schema identified in this review pass
- `getKV` stubbed
- `putKV` stubbed
- `deleteKV` stubbed

So the branch has moved from "contract only" to "partial sqlite persistence plus
test-infrastructure work", but it has not reached full KV parity.

## Challenged Assumptions

### 1. The next milestone should not jump to pgsql or Tailwind yet

The sqlite slice is still incomplete because `deleteKV` is not implemented.
Advancing to pgsql parity or Tailwind integration before sqlite CRUD is fully
closed would make the branch harder to reason about.

### 2. The new adapter testing pattern is supporting infrastructure, not the 318 deliverable

That work is useful and belongs on the branch, but it should be described as
enabling infrastructure rather than as completion of the issue 318 persistence
slice.

### 3. The shared KV tests are not yet strong enough to prove full CRUD

The migrated development plugin test currently returns only `putKV` and `getKV`
into the shared harness, so `deleteKV` is not exercised there. The shared KV
helper also only skips when `deleteKV` is missing instead of asserting delete
behavior. That means the current test pattern does not protect the missing
sqlite `deleteKV` implementation.

## Recommended Immediate Next Slice

1. implement sqlite `deleteKV`
2. strengthen the shared KV adapter tests to cover:
   - delete semantics
   - missing-key read semantics
   - JSON round-tripping beyond the current happy path
   - a representative large-string payload
3. wire the development plugin test into the stronger shared KV contract so
   sqlite failure is visible through the shared path
4. rerun repo validation after those changes
5. only then move to pgsql KV parity and explicit turso verification

## Concrete Gaps Worth Keeping In Mind

- sqlite `deleteKV` is still `notImplemented`
- pgsql KV remains entirely stubbed
- the current validation pass was cached, so this handover should not be read as
  fresh execution proof of the changed files
- root `package.json` now pipes `pnpm validate` through `awk`; keep using
  `set -o pipefail && pnpm validate` when manually validating to avoid masking
  upstream failures in a shell pipeline

## Scope Decisions Captured During Review

- treat the adapter testing utility work as supporting infrastructure, not as
  the primary issue 318 deliverable
- keep advancing the existing draft PR branch rather than planning a branch
  split right now
- treat "finish sqlite delete plus stronger KV tests" as the immediate next
  milestone

## Files To Know

- [.agents/plans/issue-318-plugin-settings-primitive-prd.md](.agents/plans/issue-318-plugin-settings-primitive-prd.md)
- [.agents/plans/issue-318-plugin-settings-primitive-implementation-plan.md](.agents/plans/issue-318-plugin-settings-primitive-implementation-plan.md)
- [.agents/plans/issue-318-key-value-store-handover.md](.agents/plans/issue-318-key-value-store-handover.md)
- [.changeset/olive-rivers-wave.md](.changeset/olive-rivers-wave.md)

## Code Landmarks

- core KV contract: `packages/oberoncms/core/src/lib/dtd.ts`
- core stubbed adapter: `packages/oberoncms/core/src/adapter/stubbed-adapter.ts`
- plugin composition fallback:
  `packages/oberoncms/core/src/adapter/init-plugins.ts`
- shared adapter tests: `packages/oberoncms/core/src/testing/adapter.ts`
- shared KV tests: `packages/oberoncms/core/src/testing/adapter/key-value.ts`
- sqlite KV schema: `packages/oberoncms/sqlite/src/db/schema/kv-schema.ts`
- sqlite KV migration:
  `packages/oberoncms/sqlite/src/db/migrations/0002_handy_stream.sql`
- sqlite adapter: `packages/oberoncms/sqlite/src/db/database-adapter.ts`
- pgsql adapter: `packages/plugins/pgsql/src/db/database-adapter.ts`
- development plugin shared test usage:
  `packages/plugins/development/src/index.test.ts`

## Suggested Restart Point For The Next Session

Start by implementing sqlite `deleteKV`, then tighten the shared KV test helper
so that the missing behavior becomes impossible to miss.
