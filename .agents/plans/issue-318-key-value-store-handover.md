# Issue 318 Handover

## Current State

- branch: `finalise/20260327-171412-key-value-store-contract`
- PR: #320
- PR URL: https://github.com/Tohuhono/Oberon/pull/320
- PR title: `WIP Add key value store adapter stubs`
- PR state: draft
- worktree: dirty

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

- [.agents/plans/issue-318-plugin-settings-primitive-prd.md](.agents/plans/issue-318-plugin-settings-primitive-prd.md)
- [.agents/plans/issue-318-plugin-settings-primitive-implementation-plan.md](.agents/plans/issue-318-plugin-settings-primitive-implementation-plan.md)
- [.changeset/olive-rivers-wave.md](.changeset/olive-rivers-wave.md)

## PR Packaging Notes

- this draft PR also includes an existing edit to
  [.agents/skills/finalise/SKILL.md](.agents/skills/finalise/SKILL.md)
- that file change was intentionally preserved when packaging the branch because
  the branch-level commit flow included all current work
- if future work should exclude it, that should be a deliberate follow-up
  decision rather than an accidental revert
