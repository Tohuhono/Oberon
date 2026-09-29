# @oberoncms/core AGENTS

This package implements the OberonCMS adapter/plugin core used by apps.

## Architecture focus

- `initOberon` performs Runtime composition and returns an `adapter` + HTTP `handler`.
- `bootstrapOberon` performs Bootstrap composition for build-time initialization.
- `initPlugins` merges plugin adapters/handlers/bootstrap hooks and applies default permissions.
- `initAdapter` augments the composed Adapter with core authorization and migration capabilities.
- `initActionHandler` applies action authorization and delegates to the Adapter.

## Data flow

Next.js route handler → `handler` → Adapter methods → Plugin adapter implementations
(storage/auth/send) → persistence.

## Core behaviors

- `bootstrapOberon()` runs plugin bootstrap hooks, seeds a welcome page, and initializes site state.
- Cache tags: `oberon-pages`, `oberon-users`, `oberon-images`, `oberon-config`.
- Mutations call `revalidatePath` + `updateTag`.
