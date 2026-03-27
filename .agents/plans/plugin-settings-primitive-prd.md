# PRD: Plugin Settings Primitive

## Purpose

Introduce a generic persistence primitive that plugins can use to store their
own durable data without requiring new core-owned tables and bespoke adapter
methods for every feature.

This PRD is broader than issue 314. The dynamic Tailwind plugin is the first
intended client, but the primitive must be useful beyond Tailwind.

## Problem

Oberon currently has no generic durable persistence surface that plugins can use
for their own namespaced data.

The current platform model is still oriented around core-owned persistence and
feature-specific expansion:

- site-wide singleton state is stored in core-owned persistence
- plugins cannot rely on a shared namespaced store for durable data
- new durable plugin-backed features tend to force bespoke adapter and schema
  expansion

That model makes extraction difficult:

- plugins cannot persist new data without expanding the base adapter API
- core accumulates ownership of feature-specific persistence concerns
- database adapters need bespoke schema and methods for each new plugin-backed
  feature

Dynamic Tailwind is a concrete example of the broader problem: once a feature
needs durable runtime state, the current approach pushes storage design toward
feature-specific tables and methods instead of a reusable plugin contract.

On this branch today, Tailwind does not have a database-backed persistence
model. The current behavior is a prebuild export to
`.oberon/tailwind/tailwind.classes`, which is then consumed by app CSS through
`@source`.

## Goal

Provide a minimal, generic plugin settings substrate that lets plugins persist
data through a namespaced key-value store with JSON payloads.

The first slice should be strong enough to support the dynamic Tailwind plugin,
including:

- mutable plugin singleton state
- immutable hash-keyed artifact records
- large JSON payloads that may contain long CSS strings

## Non-Goals

- building a rich document database or query engine for plugins
- introducing prefix scans, filtering, or secondary indexes in the first slice
- preserving the current file-export Tailwind flow as the long-term storage
  architecture
- solving every cutover concern from the current prebuild export and `@source`
  wiring in the first slice

## Primary Users

1. Plugin authors who need durable storage without expanding the base adapter
   for each feature
2. Database adapter maintainers who need one reusable persistence surface
   instead of per-feature methods and tables
3. Core maintainers who want to move feature ownership out of core and into
   plugins

## User Stories

1. As a plugin author, I can write and read namespaced JSON records through the
   shared adapter contract.
2. As a plugin author, I can persist a mutable singleton record representing my
   plugin's current state.
3. As a plugin author, I can persist immutable artifact records under stable
   keys such as hashes.
4. As a database adapter maintainer, I can implement one generic storage model
   for plugin data instead of adding a new table and methods for each feature.
5. As a core maintainer, I can remove feature-specific persistence from core
   once a plugin owns both behavior and storage usage.

## Functional Requirements

### Storage model

- The primitive must be namespaced by plugin.
- Each record must be addressable by a plugin namespace and a key.
- Each record payload must be JSON.
- JSON payloads may contain large strings.
- The first slice only requires direct key access.

### Adapter contract

- The base persistence contract must expose generic get/put/delete operations by
  namespaced key.
- The contract should be owned by core, not hidden inside the first client
  plugin.
- The contract must be implementable across sqlite, pgsql, and turso-backed
  flows.

### Concurrency model

- The first slice uses last-write-wins semantics.
- The primitive does not need stronger concurrency controls in the first slice.
- Clients must not assume the primitive provides more than last-write-wins
  semantics initially.

### Data shape guidance

- Mutable plugin state should live in singleton-style records.
- Immutable plugin artifacts should live in distinct key-addressed records.
- Plugins are responsible for their own record conventions.

## Tailwind as the First Client

The dynamic Tailwind plugin is expected to use the primitive like this:

- singleton record: current state, including active hash and current DB-derived
  class list
- immutable record per hash: compiled CSS payload only

This means the primitive must support both small and large JSON values, but it
does not need richer query semantics in the first slice.

## Success Criteria

1. Core exposes a generic plugin settings contract in the base adapter types.
2. Sqlite, pgsql, and turso-backed flows can persist plugin settings without
   introducing Tailwind-specific methods.
3. The dynamic Tailwind plugin can store its current state and hashed CSS
   artifacts entirely through the primitive.
4. The target design does not require Tailwind-specific persistence fields or
   tables.

## Risks

1. A "settings" primitive may become a de facto general-purpose data store.
2. Last-write-wins semantics simplify the first slice but weaken correctness
   guarantees for clients that later need stronger concurrent update handling.
3. Storing large CSS strings in JSON payloads may create storage and migration
   pressure if more plugins adopt artifact-like usage.

## Open Questions

1. Should the primitive be introduced as a core-owned feature before the
   Tailwind extraction, or in the same slice as the Tailwind plugin?
2. Should the settings table include metadata columns such as `updatedAt` and
   `updatedBy`, or should the first slice keep the stored shape minimal?
3. Should future slices add prefix listing, or should plugins remain limited to
   direct key access indefinitely?

## Recommended Direction

Introduce the primitive as a core-owned platform contract first, then implement
the dynamic Tailwind design on top of it as the first client.
