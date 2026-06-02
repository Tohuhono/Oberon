# OberonCMS architecture

This document records the current wiring of the monorepo. Canonical terms live in
`.agents/CONTEXT.md`; this file focuses on composition, flow, and workspace boundaries.

## Boundaries

- Applications own routes, server actions, and the server-side Oberon config passed to `initOberon`
  and `bootstrapOberon`.
- `packages/oberoncms/core` owns runtime composition, permissions, schema parsing, and component
  transform migration.
- `packages/plugins/*` add persistence, auth, storage, send, caching, and HTTP integrations.
- `packages/create-oberon-app` plus `recipes/*` define generated project shapes.

## Composition model

`initOberon(config)` is the Runtime composition root and returns `{ adapter, handler }`.
`bootstrapOberon(config)` is the Bootstrap composition root used by package `prebuild` scripts.

1. `initPlugins` reduces the ordered plugin list into merged adapter methods, a handler map, and
   version metadata.
2. `initAdapter` wraps the merged adapter with permission checks, zod parsing, and transform
   migration support.
3. `initOberon` builds a single HTTP handler that dispatches by first path segment to plugin
   handlers.

Later plugin fields override earlier ones, so plugin order is part of the runtime contract.

## Runtime flows

### CMS UI

- The app's `/cms/[[...path]]` page renders `OberonProvider`.
- `OberonProvider` reads CMS state through the adapter and exposes wrapped server actions to the
  client.
- Server actions call adapter methods, which delegate to plugin-provided implementations.

### Public rendering

- Public catch-all routes call `Render` from `@oberoncms/core/render`.
- `Render` loads page data through `adapter.getPageData` and renders configured Puck components.

### Plugin HTTP

- Apps that export the composed `handler` from `cms/api/[...path]` get plugin-owned HTTP endpoints
  routed by first path segment.

### Build lifecycle

- App `prebuild` scripts call `bootstrapOberon(config)`.
- Database plugins use top-level `bootstrap(next)` hooks to run migrations before builds.
- `@oberoncms/plugin-nextjs` adds cache tagging and revalidation around adapter reads and mutations;
  this behavior is skipped during Bootstrap composition.

## Current repo wiring

- `apps/playground`: `development`, `pgsql`, `resend`, `tailwind`, `auth`, `nextjs`; exposes CMS,
  public render, and `cms/api` routes.
- `apps/documentation`: `mockPlugin`; exposes the CMS UI only and does not export `cms/api`.
- `recipes/nextjs`: `mockPlugin`, `development`, `nextjs`, `auth`.
- `recipes/tanstack`: `mockPlugin`, `development`, `auth`.
