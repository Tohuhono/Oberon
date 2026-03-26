# Plan: Plugin Settings Primitive

## Goal

Implement a generic plugin settings substrate that plugins can use for durable
namespaced JSON persistence, with the dynamic Tailwind plugin as the first
client.

## Scope

This plan covers the new platform primitive only. It intentionally separates
that work from the higher-level dynamic Tailwind plugin behavior described in:

- [issue-314-dynamic-tailwind-plugin-prd.md](./issue-314-dynamic-tailwind-plugin-prd.md)
- [issue-314-dynamic-tailwind-plugin-implementation-plan.md](./issue-314-dynamic-tailwind-plugin-implementation-plan.md)

## Settled Decisions

- storage model is namespaced key-value
- payloads are JSON
- large JSON string payloads are allowed
- the first slice only requires get/put/delete by namespaced key
- concurrency model is last-write-wins
- Tailwind will be the first client of the primitive

## Recommended Slice Order

1. core adapter contract
2. sqlite implementation
3. pgsql and turso alignment
4. migration and deprecation path for Tailwind-specific persistence
5. test coverage and validation

## Phase 1: Core contract

### What to build

Add a generic plugin settings persistence surface to the core adapter types.

The contract should be core-owned and available to all database adapters.

### Acceptance criteria

- base adapter types include generic get/put/delete operations for namespaced
  plugin settings
- plugin composition can rely on the new contract without Tailwind-specific
  persistence methods
- documentation makes clear that the first slice is direct key access only

### Candidate files

- `packages/oberoncms/core/src/lib/dtd.ts`
- `packages/oberoncms/core/src/adapter/init-plugins.ts`

## Phase 2: Sqlite implementation

### What to build

Add a generic settings table and sqlite adapter implementation for namespaced
JSON payload records.

### Acceptance criteria

- sqlite schema includes a generic plugin settings table
- sqlite database adapter implements get/put/delete by namespaced key
- payloads round-trip as JSON
- large JSON payloads containing CSS strings are supported

### Candidate files

- `packages/oberoncms/sqlite/src/db/schema/*.ts`
- `packages/oberoncms/sqlite/src/db/database-adapter.ts`
- sqlite migrations under the same package

## Phase 3: Pgsql and turso alignment

### What to build

Mirror the generic settings implementation in pgsql and ensure turso-backed
flows receive the same capability through the shared sqlite adapter path.

### Acceptance criteria

- pgsql schema includes a generic plugin settings table
- pgsql database adapter implements the same contract as sqlite
- turso-backed flows inherit working settings support

### Candidate files

- `packages/plugins/pgsql/src/db/schema/*.ts`
- `packages/plugins/pgsql/src/db/database-adapter.ts`
- `packages/plugins/turso/src/index.ts`

## Phase 4: Tailwind persistence migration path

### What to build

Prepare the system so Tailwind-specific persistence can move off the current
site field and dedicated tables onto the generic settings primitive.

This phase is a migration bridge, not the full Tailwind behavior rewrite.

### Acceptance criteria

- the plan for removing `activeTailwindHash` from site-owned persistence is
  documented
- the plan for removing dedicated `tailwind_assets` tables is documented
- the dynamic Tailwind plugin can be implemented without adding new persistence
  primitives

### Candidate files

- `packages/oberoncms/sqlite/src/db/schema/site-schema.ts`
- `packages/plugins/pgsql/src/db/schema/site-schema.ts`
- `packages/oberoncms/sqlite/src/db/schema/tailwind-schema.ts`
- `packages/plugins/pgsql/src/db/schema/tailwind-schema.ts`

## Phase 5: Tests and validation

### What to build

Add tests for the new generic settings substrate and validate the repo through
the normal root flow.

### Acceptance criteria

- unit or integration coverage proves get/put/delete behavior
- tests prove JSON round-tripping and support for long string payloads
- `pnpm validate` passes from repo root after implementation

## Risks and Mitigations

1. Risk: the primitive grows into an unbounded plugin data store Mitigation:
   keep the first slice to direct key access only
2. Risk: last-write-wins loses safety compared with current Tailwind behavior
   Mitigation: document this as intentional and update tests accordingly
3. Risk: a Tailwind-led design leaks feature assumptions into the primitive
   Mitigation: keep the contract generic and put plugin-specific conventions in
   plugin docs, not core types

## Completion Condition

This plan is complete when core and DB adapters expose a working generic plugin
settings substrate that the dynamic Tailwind plugin can use without introducing
new feature-specific persistence methods.
