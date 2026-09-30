# OberonCMS architecture

This document records the current wiring of the monorepo. Canonical terms live in
`.agents/CONTEXT.md`; this file focuses on composition, flow, and workspace boundaries.

## Boundaries

- Applications own routes, server actions, and the server-side Oberon config passed to `initAdapter`
  and `bootstrapOberon`.
- `packages/oberoncms/core` owns runtime composition, authorization, action orchestration, and
  component transform migration.
- `packages/plugins/*` add persistence, auth, storage, send, caching, and HTTP integrations.
- `packages/create-oberon-app` plus `recipes/*` define generated project shapes.

## Composition model

`initAdapter(config)` is the Runtime composition root and returns the final Adapter.
`bootstrapOberon(config)` is the Bootstrap composition root used by package `prebuild` scripts.

1. `initAdapter` initializes Plugin composition, creates the late-bound `getAdapter`, and adds core
   capabilities such as `can`, `will`, `whoWill`, paths, Site config, and transform migration before
   binding the getter to that final Adapter.
2. `initPlugins` collects declarative Plugin definitions, composes Adapter middleware, and returns
   REST Handler factories, Bootstrap tasks, and version metadata to `initAdapter`.
3. `createActionHandler(adapter)` builds authorized Oberon actions from the Adapter. Framework
   entrypoints validate external input and expose those actions to clients.
4. `createRestHandler(adapter)` projects the Adapter's lazy HTTP dispatch capability into
   framework-compatible methods that route by first path segment to Plugin handlers.

Adapter hooks are initialized once with the final Adapter getter and the preceding implementation,
then return a method with the original Adapter signature. The getter throws during hook factory
initialization and resolves the final augmented Adapter when returned methods execute. Later hooks
are outermost and use `next` to continue earlier implementations. Plugin order controls middleware
nesting, replacement precedence, and sequential Bootstrap order.

## Runtime flows

### CMS UI

- The app's `/cms/[[...path]]` page renders `OberonProvider`.
- `OberonProvider` reads CMS state through the adapter and exposes wrapped server actions to the
  client.
- Server actions authorize calls through Adapter `will`/`whoWill` capabilities before delegating to
  unrestricted Adapter methods. Next.js parses action input inside Server Functions; TanStack parses
  it through `createServerFn().validator()`.

### Public rendering

- Public catch-all routes call `Render` from `@oberoncms/core/render`.
- `Render` loads page data through `adapter.getPageData` and renders configured Puck components.

### Plugin HTTP

- Apps that export `createRestHandler(adapter)` methods from `cms/api/[...path]` get plugin-owned
  HTTP endpoints routed by first path segment. Plugin Handler factories initialize once on the first
  REST request.

### Build lifecycle

- App `prebuild` scripts call `bootstrapOberon(config)`.
- Database plugins use top-level `bootstrap({ adapter })` tasks to run migrations before builds.
- Bootstrap tasks are awaited in configured order before core initializes Page and Site state.
- `@oberoncms/plugin-nextjs` adds cache tagging and revalidation around adapter reads and mutations;
  this behavior is skipped during Bootstrap composition.

## Current repo wiring

- `apps/playground`: `development`, `pgsql`, `resend`, `tailwind`, `auth`, `nextjs`; exposes CMS,
  public render, and `cms/api` routes.
- `apps/documentation`: `mockPlugin`; exposes the CMS UI only and does not export `cms/api`.
- `recipes/nextjs`: `mockPlugin`, `development`, `nextjs`, `auth`.
- `recipes/tanstack`: `mockPlugin`, `development`, `auth`.
