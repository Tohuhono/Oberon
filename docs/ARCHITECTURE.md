# OberonCMS architecture

This document describes the architecture currently implemented in the monorepo.
It focuses on runtime composition, data flow, and workspace boundaries.

## Monorepo shape

The repository is a pnpm workspace + turborepo with these layers:

- Applications: `apps/playground`, `apps/documentation`, `recipes/nextjs`
- Core runtime: `packages/oberoncms/core`
- Database/auth adapters: `packages/oberoncms/sqlite`,
  `packages/plugins/development`, `packages/plugins/turso`,
  `packages/plugins/pgsql`
- Media/storage plugins: `packages/plugins/uploadthing`,
  `packages/plugins/flydrive`
- Shared UI/utilities: `packages/tohuhono/ui`, `packages/tohuhono/puck-blocks`,
  `packages/tohuhono/utils`
- Tooling/config: `config/eslint`, `config/typescript`, `config/vite`,
  `config/scripts`
- Scaffolding: `packages/create-oberon-app`

## Core runtime model (`@oberoncms/core`)

`initOberon` is the composition root:

- Input: `config` + ordered `plugins`
- Output: `adapter` + HTTP `handler`

Composition pipeline:

1. `initPlugins` reduces plugin list into:
   - merged plugin adapter implementation
   - merged plugin HTTP handlers map
   - plugin version metadata
2. `initAdapter` wraps the merged adapter with:
   - permission checks (`can`/`will`)
   - validation (zod schemas)
   - Next.js caching (`unstable_cache`, cache tags)
   - revalidation (`revalidatePath`, `updateTag`)
   - component transform migration pipeline
3. `initOberon` builds a catch-all HTTP handler that dispatches by first path
   segment to plugin handlers (e.g. `auth`, `uploadthing`, `flydrive`).

### Core data flow

CMS UI flow:

1. Next.js `app/.../cms/[[...path]]/page.tsx` mounts `OberonProvider`
2. `OberonProvider` loads page/users/images/site context from `adapter`
3. Client renders `OberonClient` and calls wrapped server actions
4. Server actions call `adapter` methods through `wrap(...)`
5. Adapter methods call plugin-provided persistence/auth/send methods

Public render flow:

1. App catch-all route calls `Render` from `@oberoncms/core/render`
2. `Render` loads page data via `adapter.getPageData`
3. Puck `Render` renders configured components for that slug

Plugin HTTP flow:

1. App route `cms/api/[...path]` exports `handler` methods
2. `handler` resolves first segment to a plugin handler
3. Plugin handler serves integration-specific endpoints

## Adapter/plugin contract

Plugins are `OberonPlugin` factories and can contribute:

- `adapter` methods (partial overrides/extensions)
- `handlers` for HTTP routes
- `name`, `version`, optional `disabled`

Plugin order matters because adapter methods are merged left-to-right with later
plugins overriding earlier fields.

Base behavior (from `initPlugins`):

- default permissions for `unauthenticated` and `user`
- stubbed `notImplemented` methods for all adapter operations
- prebuild wrapper that seeds a welcome page if the page list is empty

## Data model and caching

Logical entities:

- pages (`key`, `data`, `updatedAt`, `updatedBy`)
- images (`key`, `url`, dimensions, metadata)
- users (`id`, `email`, `role`)
- site config (`version`, component transform versions)
- auth entities (users/accounts/sessions/verification tokens)

Cache tags used by core adapter:

- `oberon-pages`
- `oberon-users`
- `oberon-images`
- `oberon-config`

Mutations invalidate relevant tags and page paths.

## Build and prebuild lifecycle

All Next.js apps define a `prebuild` script that calls `adapter.prebuild()`.
Current prebuild behavior in core:

1. run plugin `prebuild`
2. seed welcome page when storage is empty
3. export Tailwind class usage to `.oberon/tailwind.classes`

Turbo tasks wire this into `build` via `dependsOn: ["prebuild", ...]`.

## App implementations

### `apps/playground`

- Adapter: `initOberon({ config, plugins: [mockPlugin, developmentPlugin] })`
- CMS routes: `app/(oberon)/cms/[[...path]]`, plus `cms/api/[...path]`
- Public render route: `app/(oberon)/[[...path]]`
- Config includes `Image` block from uploadthing package

### `apps/documentation`

- Adapter: `initOberon({ config, plugins: [mockPlugin] })`
- CMS route: `src/app/cms/[[...path]]`
- No `cms/api/[...path]` route in this app
- Intended as docs/demo context rather than full plugin integration wiring

### `recipes/nextjs`

- Template baseline from repo:
  `plugins: [mockPlugin, developmentPlugin, authPlugin]`
- Includes CMS route, API route, and public catch-all render route
- `create-oberon-app` customizes this pattern by generating adapter/plugin files

## Plugin inventory

- `@oberoncms/plugin-development`
  - dev-only send adapter (logs tokens instead of sending)
  - dev database adapter via local sqlite + migrations
- `@oberoncms/plugin-turso`
  - libsql/Turso-backed DB adapter
- `@oberoncms/plugin-pgsql`
  - PostgreSQL Drizzle-backed DB adapter
- `@oberoncms/plugin-uploadthing`
  - image block + uploadthing route handler (`uploadthing`)
- `@oberoncms/plugin-flydrive`
  - image block + flydrive route handler (`flydrive`)

## Current state notes

- The playground and documentation apps both include `mockPlugin`, so auth/user
  context is mocked in those environments by default.
- `apps/playground/oberon/send.ts` defines a Resend plugin but it is not wired
  into `apps/playground/oberon/adapter.ts`.
- `plugin-turso` and `plugin-pgsql` currently expose an `init` adapter field;
  core calls `prebuild`, so migration hooks in those plugins are not currently
  invoked through the shared prebuild path.
