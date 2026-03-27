# Issue 318 Handover

## Current State

- branch: `finalise/20260327-171412-key-value-store-contract`
- commit: `1f538b6949439f8e78acdb56f97a662376e8c1fc`
- PR: #320
- PR URL: https://github.com/Tohuhono/Oberon/pull/320
- PR title: `WIP Add key value store adapter stubs`
- PR state: draft
- worktree: clean

## Completed Slice

This branch only delivers the first contract slice for issue 318.

Implemented:

- core adapter contract now exposes `getKV`, `putKV`, and `deleteKV`
- KV payload type is `JsonValue`, inferred from `z.json()`
- plugin composition fallback stubs exist in core via `notImplemented`
- mock plugin overrides KV methods with demo-only `notAvailable` stubs
- sqlite adapter has explicit KV stubs only, not real persistence
- pgsql adapter has explicit KV stubs only, not real persistence
- `create-oberon-app` custom database template has matching KV stubs
- issue 318 PRD and implementation plan wording is aligned to "key value store"

Not implemented yet:

- sqlite schema/table for KV records
- sqlite `getKV` / `putKV` / `deleteKV` behavior
- pgsql schema/table for KV records
- pgsql `getKV` / `putKV` / `deleteKV` behavior
- turso verification through sqlite path
- repo-wide validation for the full persistence slice

## Files To Know

- [packages/oberoncms/core/src/lib/dtd.ts](packages/oberoncms/core/src/lib/dtd.ts)
- [packages/oberoncms/core/src/adapter/init-plugins.ts](packages/oberoncms/core/src/adapter/init-plugins.ts)
- [packages/oberoncms/core/src/adapter/mock-plugin.ts](packages/oberoncms/core/src/adapter/mock-plugin.ts)
- [packages/oberoncms/core/src/adapter/init-plugins.test.ts](packages/oberoncms/core/src/adapter/init-plugins.test.ts)
- [packages/oberoncms/sqlite/src/db/database-adapter.ts](packages/oberoncms/sqlite/src/db/database-adapter.ts)
- [packages/plugins/pgsql/src/db/database-adapter.ts](packages/plugins/pgsql/src/db/database-adapter.ts)
- [packages/create-oberon-app/plugins/database/custom.ts](packages/create-oberon-app/plugins/database/custom.ts)
- [.agents/plans/issue-318-plugin-settings-primitive-prd.md](.agents/plans/issue-318-plugin-settings-primitive-prd.md)
- [.agents/plans/issue-318-plugin-settings-primitive-implementation-plan.md](.agents/plans/issue-318-plugin-settings-primitive-implementation-plan.md)
- [.changeset/olive-rivers-wave.md](.changeset/olive-rivers-wave.md)

## Validation Done

Ran:

- `pnpm test:unit -- src/adapter/init-plugins.test.ts`

Observed result:

- core test passes
- no editor errors remained in touched files at the end of the session

## Important Workflow Notes

- run lifecycle commands from repo root only
- use root scripts only: `pnpm test:unit`, `pnpm test:tdd`, `pnpm validate`
- do not use package-local scripts, ad-hoc turbo filters, or direct build/start
  commands for validation
- the attempted tag flow `pnpm test:unit -- --tags-filter="issue-318"` failed
  because `issue-318` is not a configured global Vitest tag across packages
- the reliable narrow loop used here was file-targeted:
  `pnpm test:unit -- src/adapter/init-plugins.test.ts`

## Next TDD Slice

Recommended next slice: sqlite behavior first.

Target behavior order:

1. `putKV(namespace, key, value)` stores JSON for one namespaced key
2. `getKV(namespace, key)` returns the same JSON value
3. `deleteKV(namespace, key)` removes that value and later reads return `null`
4. overwriting the same namespaced key is last-write-wins
5. large string payloads round-trip

Likely files for that slice:

- [packages/oberoncms/sqlite/src/db/schema/index.ts](packages/oberoncms/sqlite/src/db/schema/index.ts)
- [packages/oberoncms/sqlite/src/db/schema](packages/oberoncms/sqlite/src/db/schema)
- [packages/oberoncms/sqlite/src/db/database-adapter.ts](packages/oberoncms/sqlite/src/db/database-adapter.ts)
- [packages/oberoncms/sqlite/src/db/migrations](packages/oberoncms/sqlite/src/db/migrations)

Suggested test shape:

- keep the existing core test as the contract guard
- add a sqlite-focused unit or integration test that exercises real adapter
  behavior through `getDatabaseAdapter`
- prefer proving observable KV behavior instead of implementation details

## PR Packaging Notes

- this draft PR also includes an existing edit to
  [.agents/skills/finalise/SKILL.md](.agents/skills/finalise/SKILL.md)
- that file change was intentionally preserved when packaging the branch because
  the branch-level commit flow included all current work
- if future work should exclude it, that should be a deliberate follow-up
  decision rather than an accidental revert

## Resume Prompt

Use this to resume in a new session:

"Continue issue 318 from
[.agents/plans/issue-318-key-value-store-handover.md](.agents/plans/issue-318-key-value-store-handover.md).
Stay on branch `finalise/20260327-171412-key-value-store-contract` and implement
the next TDD slice: sqlite key value store persistence with tests first."
