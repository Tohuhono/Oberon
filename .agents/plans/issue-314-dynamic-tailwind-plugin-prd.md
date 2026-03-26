# PRD: Issue 314 - Dynamic Tailwind Plugin

> Supersedes the earlier single-feature persistence direction captured in
> [issue-314-db-backed-tailwind-assets.md](./issue-314-db-backed-tailwind-assets.md).

## Purpose

Reframe issue 314 around a plugin-owned dynamic Tailwind system that sits on top
of a new generic plugin settings primitive.

## Problem

The current issue 314 direction collapsed two separate CSS concerns into one
feature:

- the normal application Tailwind build
- the dynamic hashed CSS derived from DB content

That created multiple problems:

- dynamic CSS was treated as if it owned too much of the app stylesheet
- Tailwind persistence lived directly in core and DB adapters
- Vercel/runtime failures surfaced around the dynamic asset path and resolver
  assumptions
- extraction into a true plugin was blocked by the absence of generic plugin
  persistence

## Goal

Deliver a dynamic Tailwind plugin with a clean two-asset model:

1. Asset one is the standard application Tailwind output built normally from
   file-discovered classes.
2. Asset two is a separate hashed utilities stylesheet generated from published
   DB page classes.

The plugin must own the behavior for asset two while relying on the generic
plugin settings primitive for persistence.

## Non-Goals

- replacing the normal application Tailwind build
- making the dynamic asset responsible for base, preflight, or whole-app theme
  CSS
- preserving the current stale-write conflict policy
- solving exact shrinking behavior for class removals in the first slice

## Users

1. Site operators who need DB-authored content to pick up dynamic Tailwind
   utilities
2. Core maintainers who want Tailwind behavior out of core-owned persistence
3. App/template consumers who need the dynamic layer to be additive rather than
   a replacement for their normal stylesheet

## User Stories

1. As an app owner, I keep my normal Tailwind build and file discovery exactly
   as before.
2. As a CMS user, published DB content can activate a second stylesheet that
   contains the utilities needed for published DB classes.
3. As a CMS user, the public site can render with the standard stylesheet even
   if the dynamic hashed asset is missing.
4. As a maintainer, I can move Tailwind-specific behavior into a plugin instead
   of keeping persistence and lifecycle logic in core.

## Functional Requirements

### Two-asset model

- The normal build-time Tailwind asset must continue using standard file-based
  discovery, standard config, and standard PostCSS.
- The dynamic Tailwind asset must be a second stylesheet loaded after the
  standard one.
- The dynamic asset must be utilities-only.
- The standard asset must ignore DB content entirely.

### Dynamic asset generation

- The dynamic asset must be derived from the union of published DB page classes.
- Publish should generate the dynamic asset when that DB-derived class set
  changes.
- Prebuild reconciliation is also allowed to regenerate and retarget the active
  dynamic asset.
- Missing dynamic assets are non-fatal because the standard asset remains
  available.

### Persistence model

- The plugin must use the generic plugin settings primitive.
- Immutable dynamic asset entries are keyed by hash and store CSS payload only.
- Mutable plugin state stores at least the active hash and current DB-derived
  class list.
- The first implementation accepts last-write-wins behavior.

### Routing and render contract

- Dynamic assets remain publicly fetchable by hash.
- Public renderers load the active hashed stylesheet outside core render.
- Dynamic styles are layered after the standard stylesheet.

## Success Criteria

1. The dynamic Tailwind feature is no longer owned by core-specific persistence
   methods and tables.
2. The standard application stylesheet remains unchanged in role and behavior.
3. The dynamic plugin can publish and reconcile hashed utility assets from DB
   content.
4. The plugin can degrade safely to the standard stylesheet when the hashed
   asset is absent.

## Deferred Work

1. smarter shrink behavior when the effective DB class set loses utilities
2. richer concurrency controls than last-write-wins
3. more generic plugin settings query capabilities such as prefix listing

## Open Questions

1. How much of the current `tailwind.sourceCssFile` contract survives once the
   feature becomes a plugin-owned utilities layer?
2. Should prebuild reconciliation remain in the same prebuild chain as welcome
   page initialization, or simply share the lifecycle without sharing the same
   code path?
3. What is the cleanest migration path from current site/tailwind tables to the
   new plugin settings store?
