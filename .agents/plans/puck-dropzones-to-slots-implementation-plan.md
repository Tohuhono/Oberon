# Plan: Puck DropZones to Slots

## Goal

Replace the deprecated Puck DropZone pattern in shared Oberon blocks with slot
fields and current source-level Puck configuration.

## Scope

This plan covers source changes only.

It does not include:

- stored data migration
- compatibility shims for legacy saved pages
- broader text or asset field redesign

## Settled Decisions

- deprecated DropZone usage should be removed outright
- source should move to current slot patterns even if existing stored content is
  not migrated in this plan
- only the actual DropZone users found in source are in scope

## Recommended Slice Order

1. convert `Container`
2. convert `Prose`
3. sweep docs and validation

## Phase 1: Container slot conversion

### What to build

Replace the `Container` block's `renderDropZone` usage with a slot field and the
slot render function.

### Acceptance criteria

- `Container` no longer reads `puck.renderDropZone`
- `Container` declares nested content through a slot field
- the component renders nested content through the slot render function

### Candidate files

- `packages/tohuhono/puck-blocks/src/blocks/container.tsx`

## Phase 2: Prose slot conversion

### What to build

Replace the `Prose` block's DropZone usage with the same slot-based pattern so
shared nested-content blocks are consistent.

### Acceptance criteria

- `Prose` no longer reads `puck.renderDropZone`
- `Prose` declares nested content through a slot field
- `Prose` renders nested content through the slot render function

### Candidate files

- `packages/tohuhono/puck-blocks/src/prose.tsx`

## Phase 3: Source sweep and validation

### What to build

Remove any remaining source-level DropZone usage in the repo surface covered by
the review and validate the repo from root.

### Acceptance criteria

- no source files under `packages/**/src` still use `renderDropZone`
- no source files under `packages/**/src` still render Puck `DropZone` for the
  covered Oberon block patterns
- `pnpm validate` passes from repo root after the change

### Candidate files

- `packages/tohuhono/puck-blocks/src/**`
- any adjacent docs or examples that reference the old pattern

## Risks and Mitigations

1. Risk: source changes break rendering for stored legacy content Mitigation:
   treat that as an explicit out-of-scope consequence of this plan, not a hidden
   compatibility promise
2. Risk: slot conversion changes block ergonomics unexpectedly Mitigation: keep
   each conversion narrow and validate both editor and render behavior before
   moving on

## Completion Condition

This plan is complete when the shared Oberon blocks no longer use DropZones in
source and the repo validates cleanly from root.
