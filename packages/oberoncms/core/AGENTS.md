# @oberoncms/core AGENTS

This package implements the OberonCMS adapter/plugin core used by apps.

## Architecture focus

- `initAdapter` performs Runtime composition and returns the final Adapter.
- `bootstrapOberon` performs Bootstrap composition for build-time initialization.
- The private phase composer owns Plugin composition, binds the late final Adapter getter, and adds
  core authorization, migration, and lazy REST dispatch capabilities.
- `bootstrapOberon` runs closure-bound Plugin Bootstrap tasks before core Page and Site setup.
- `createActionHandler(adapter)` applies action authorization and delegates to the Adapter.
- `createRestHandler(adapter)` exposes the Adapter's Plugin HTTP dispatch as route methods.

## Data flow

Next.js route handler → `createRestHandler(adapter)` → Adapter methods → Plugin implementations
(storage/auth/send) → persistence.

## Core behaviors

- `bootstrapOberon()` runs plugin bootstrap hooks, seeds a welcome page, and initializes site state.
- Cache tags: `oberon-pages`, `oberon-users`, `oberon-images`, `oberon-config`.
- Mutations call `revalidatePath` + `updateTag`.
