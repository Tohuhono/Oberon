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

- `adapter.prebuild()` exports Tailwind classes and seeds a welcome page.
- Cache tags: `oberon-pages`, `oberon-users`, `oberon-images`, `oberon-config`.
- Mutations call `revalidatePath` + `updateTag`.
