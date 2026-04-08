# Plan: Puck Modernization Roadmap

## Goal

Break the current Puck modernization work into independent plans that can be
picked up separately while still landing in a coherent order.

## Scope

This roadmap only covers the narrowed modernization scope from the April 2026
review:

- replace deprecated DropZone usage with current slot patterns
- align the Oberon editor shell with current Puck extension surfaces
- reduce brittle preview iframe coupling
- align the workspace on the latest `0.21.x` Puck release during the work

This roadmap intentionally excludes:

- data migrations of stored pages or component payloads
- rich text adoption
- image field redesign
- AI-related Puck features

## Settled Decisions

- Oberon navigation remains primary over a stock Puck shell
- hard migration means source-level pattern replacement only
- data migration is out of scope for this work
- the target is current `@puckeditor/core` `0.21.x`, not a broader redesign

## Recommended Work Order

1. [puck-dropzones-to-slots-implementation-plan.md](./puck-dropzones-to-slots-implementation-plan.md)
2. [issue-329-puck-editor-shell-alignment-plan.md](./issue-329-puck-editor-shell-alignment-plan.md)
3. [puck-preview-iframe-alignment-plan.md](./puck-preview-iframe-alignment-plan.md)

## Why This Order

The DropZone replacement is the only source-level deprecated Puck pattern found
in the repo, so it should be removed first.

The editor shell work comes next because it decides how much of Puck's current
layout, header, and plugin model Oberon wants to adopt while preserving its own
navigation.

The preview iframe work should follow the shell decision because its best shape
depends on whether the editor remains override-heavy or moves toward Puck
composition.

## Shared Validation Rule

Each plan should finish by validating from repo root using the canonical flow.

- preferred validation target: `pnpm validate`

## Completion Condition

This roadmap is complete when the three linked plans have been executed and the
repo no longer relies on the deprecated DropZone pattern or the current brittle
editor and preview integration seams identified in the review.
