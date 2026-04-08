# Plan: Puck Preview Iframe Alignment

## Goal

Reduce brittle coupling to Puck's preview iframe internals and align Oberon's
preview theming and shell behavior with current Puck iframe, viewport, and
composition surfaces.

## Scope

This plan covers how Oberon styles and coordinates the editor preview iframe.

It does not include:

- editor-shell redesign beyond required integration points
- data migrations
- rich text or asset field work

## Settled Decisions

- the current hard-coded iframe DOM reach-in is a modernization target
- Oberon still needs same-origin preview theming and app-theme propagation
- the preferred end state uses supported Puck seams rather than implicit DOM
  contracts where possible

## Recommended Slice Order

1. define the supported preview integration seam
2. move theme propagation onto that seam
3. align preview wrappers and validation

## Phase 1: Preview integration seam

### What to build

Identify and implement the main integration seam Oberon will use for preview
iframe behavior, based on the chosen editor-shell architecture.

### Acceptance criteria

- preview integration does not depend primarily on querying a hard-coded iframe
  id
- the chosen approach is compatible with current Puck iframe and viewport
  behavior
- the seam is clear enough that future preview changes do not require DOM
  archaeology

### Candidate files

- `packages/tohuhono/ui/src/theme/dynamic-tailwind.tsx`
- `packages/oberoncms/core/src/editor.tsx`
- `packages/oberoncms/core/src/components/preview.tsx`

## Phase 2: Theme and mode propagation

### What to build

Move font, theme, and mode propagation to the chosen preview seam while keeping
the current Oberon preview behavior intact.

### Acceptance criteria

- preview theme propagation still works in the editor iframe
- dark mode and other body or root-level theme signals still reach the preview
- the implementation is less dependent on imperative DOM mutation than the
  current approach

### Candidate files

- `packages/tohuhono/ui/src/theme/dynamic-tailwind.tsx`
- `packages/oberoncms/core/src/editor.tsx`

## Phase 3: Preview wrapper alignment and validation

### What to build

Align editor preview and published preview wrappers so the shell and styling
story is coherent, then validate the repo from root.

### Acceptance criteria

- editor preview and preview mode use a consistent wrapper strategy
- preview-specific shell code is simpler than the current implementation
- `pnpm validate` passes from repo root after the change

### Candidate files

- `packages/oberoncms/core/src/editor.tsx`
- `packages/oberoncms/core/src/components/preview.tsx`
- any adjacent preview helper modules

## Risks and Mitigations

1. Risk: a cleaner integration seam loses necessary theme propagation behavior
   Mitigation: validate parity in preview mode before removing existing logic
2. Risk: the best preview seam depends on editor-shell decisions not yet made
   Mitigation: execute this plan after the editor-shell plan or revisit the
   first phase once that decision is settled

## Completion Condition

This plan is complete when Oberon's preview theming and iframe behavior no
longer rely on the current brittle DOM reach-in pattern and the repo validates
cleanly from root.
