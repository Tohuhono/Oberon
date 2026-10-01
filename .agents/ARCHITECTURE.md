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

1. The private phase composer initializes Plugins, creates the late-bound `getAdapter`, and adds
   core capabilities such as `can`, `will`, `whoWill`, paths, Site config, transform migration, and
   lazy REST dispatch before binding the getter to the final Adapter.
2. `initAdapter(config)` selects Runtime composition and returns only its final Adapter.
3. `bootstrapOberon(config)` selects Bootstrap composition, runs closure-bound Plugin Bootstrap
   tasks sequentially, then initializes Page and Site state.
4. `createActionHandler(adapter)` builds authorized Oberon actions from the Adapter. Framework
   entrypoints validate external input and expose those actions to clients.
5. `adapter.handleRequest` lazily routes standard Web Requests by method and first path segment to
   Plugin handlers.
6. Each Framework integration's `createRestHandler(adapter)` projects that dispatch capability into
   its host framework's native route-handler shape.

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

- Apps mount the `createRestHandler(adapter)` projection from their Framework integration at the
  host framework's `cms/api` catch-all route. Plugin Handler factories initialize once on the first
  REST request.

### Build lifecycle

- App `prebuild` scripts call `bootstrapOberon(config)`.
- Plugin phase factories receive `getAdapter`; Bootstrap tasks close over it when they need the
  final Adapter. Database migration tasks need no Adapter access.
- Bootstrap tasks are awaited in configured order before core initializes Page and Site state.
- `@oberoncms/plugin-nextjs` adds cache tagging and revalidation around adapter reads and mutations;
  this behavior is skipped during Bootstrap composition.

## Current repo wiring

- `apps/playground`: `development`, `pgsql`, `resend`, `tailwind`, `auth`, `nextjs`; exposes CMS,
  public render, and `cms/api` routes.
- `apps/documentation`: `mockPlugin`; exposes the CMS UI only and does not export `cms/api`.
- `recipes/nextjs`: `mockPlugin`, `development`, `nextjs`, `auth`.
- `recipes/tanstack`: `mockPlugin`, `development`, `tanstack`, `auth`; exposes `cms/api` routes.
