# Plan: Puck Editor Shell Alignment

Issue: [#329](https://github.com/Tohuhono/Oberon/issues/329)

## Goal

Align the Oberon editor shell around a clear product boundary: Oberon owns the
header and tool surfaces, while Puck continues to own the center editor panel.

## Scope

This plan covers the editor shell around the Puck editor, including the header,
desktop tool surfaces, right-sidebar behavior, and how supported Puck UI plugins
are presented inside that shell.

It does not include:

- redesigning the Puck center panel itself
- preview iframe internals beyond shell integration points
- data migrations
- rich text adoption
- image field redesign
- mobile-first delivery as an early implementation gate

## Settled Decisions

- Oberon navigation remains primary
- the goal is not to become a stock Puck UI
- the Puck center panel should stay visually and behaviorally close to current
  Puck, including its existing preview chrome and viewport controls
- Oberon should own the header
- the target desktop shell has no left-side Puck tool surface
- the target desktop tool model is a single Oberon-owned right sidebar with tabs
- the right sidebar should include Insert, Outline, and Inspector tabs
- supported Puck UI plugins should appear as additional right-sidebar tabs
- page-level editing should continue through root selection in the Inspector,
  not a separate Page tab
- component selection should drive the Inspector
- the left-side Puck tools should only be removed once the right-side
  replacement exists
- generic supported-plugin tab hosting can follow the core shell work
- mobile should mirror the desktop tool model through a bottom-sheet surface,
  but that should land after the desktop shell direction is stable

## Recommended Slice Order

1. lock the target shell architecture and align the header to it
2. land the single right-sidebar desktop shell for core tabs
3. remove the left-side desktop tool surface once the replacement exists
4. add supported Puck plugin tab hosting
5. validate and then extend the same model to mobile

## Phase 1: Shell architecture and header alignment

### What to build

Document and encode the shell boundary in source: Oberon owns the shell around
the editor, but the Puck center panel remains intact. Align the current header
to that target rather than optimizing for a smaller override surface.

### Acceptance criteria

- the target shell architecture is explicit in code or adjacent docs
- the plan no longer frames success primarily as shrinking header overrides
- the shell preserves Oberon navigation and publish, preview, and view actions
- the header direction clearly serves the future single-right-sidebar shell
- the resulting design still treats the Puck center panel as a preserved product
  surface

### Candidate files

- `packages/oberoncms/core/src/components/editor.tsx`
- `packages/oberoncms/core/src/editor.tsx`
- `packages/oberoncms/core/src/components/menu.tsx`

## Phase 2: Desktop right-sidebar shell

### What to build

Introduce the Oberon-owned right-sidebar shell model on desktop, using tabs for
Insert, Outline, and Inspector while reusing existing Puck tool content where
practical.

### Acceptance criteria

- desktop has a single right-sidebar tool surface owned by Oberon
- the right sidebar exposes Insert, Outline, and Inspector as first-class tabs
- Inspector content follows the current selection
- root selection still enables page-level editing through Inspector
- the implementation reuses current Puck tool surfaces where that preserves the
  desired UX

### Candidate files

- `packages/oberoncms/core/src/components/editor.tsx`
- `packages/oberoncms/core/src/editor.tsx`
- any new shell or right-sidebar components introduced for the desktop editor

## Phase 3: Left-side removal and supported plugin tabs

### What to build

Remove the desktop left-side Puck tool surface once the right-side replacement
is functional, then define how supported Puck UI plugins appear as additional
tabs in the Oberon sidebar.

### Acceptance criteria

- the desktop left-side Puck tool surface is no longer required for core flows
- Insert remains available through the right sidebar after left-side removal
- supported Puck UI plugins can be surfaced as additional right-sidebar tabs
- the shell does not regress to exposing the old Puck plugin strip as the
  primary desktop tool model

### Candidate files

- `packages/oberoncms/core/src/components/editor.tsx`
- `packages/oberoncms/core/src/editor.tsx`
- any new tab registration or shell integration modules introduced for supported
  Puck UI plugins

## Phase 4: Mobile alignment, validation, and cleanup

### What to build

Carry the same tool model to mobile through a bottom-sheet surface, clean up any
desktop shell plumbing that no longer serves the target architecture, and
validate from repo root.

### Acceptance criteria

- mobile uses the same conceptual tools as desktop in a bottom-sheet form
- shell code reflects the settled Oberon-owned header and right-tool model
- obsolete transition-only shell plumbing is removed or simplified
- `pnpm validate` passes from repo root after the change

### Candidate files

- `packages/oberoncms/core/src/components/editor.tsx`
- `packages/oberoncms/core/src/editor.tsx`
- any new mobile shell or bottom-sheet components introduced for the editor

## Risks and Mitigations

1. Risk: preserving the Puck center panel while replacing surrounding chrome
   creates a visually inconsistent hybrid Mitigation: treat the center panel as
   an intentional preserved surface and make the Oberon shell decisions around
   it explicit
2. Risk: removing the left-side Puck tools too early strands insertion and
   outline workflows Mitigation: only remove the left-side surface once the
   right-sidebar replacement is functional
3. Risk: supporting Puck UI plugins becomes harder once Oberon replaces the
   desktop tool presentation Mitigation: define supported plugin hosting as an
   explicit follow-on slice, not an accidental casualty of the shell redesign
4. Risk: mobile constraints distort early shell decisions Mitigation:
   acknowledge the mobile target now, but do not make it an early implementation
   gate

## Completion Condition

This plan is complete when Oberon owns the editor shell around a preserved Puck
center panel, desktop tool flows live in the single right sidebar, supported
Puck UI plugins have a defined place in that model, and the repo validates
cleanly from root.
