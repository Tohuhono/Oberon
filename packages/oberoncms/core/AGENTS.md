# @oberoncms/core AGENTS

This package implements the OberonCMS adapter/plugin core used by apps.

## Architecture focus

- `initOberon` composes plugins and returns an `adapter` + HTTP `handler`.
- `initPlugins` merges plugin adapters/handlers and applies default permissions.
- `initAdapter` wraps permissions, caching, revalidation, and migrations.

## Data flow

Next.js route handler → `handler` → `adapter` methods → plugin adapter
implementations (storage/auth/send) → persistence.

## Core behaviors

- `adapter.prebuild()` seeds a welcome page through the wrapped `updatePageData`
  boundary when storage is empty.
- Cache tags: `oberon-pages`, `oberon-users`, `oberon-images`, `oberon-config`.
- Mutations call `revalidatePath` + `updateTag`.
- `updatePageData` is the live page-data update boundary for publish,
  migrations, and welcome-page initialization.
